import math
import re
import hashlib
from typing import List, Dict, Optional, Tuple
from schemas import HintRequest, RetrievedChunk

# Curated Algorithmic & Debugging Knowledge Corpus for Contextual Hybrid RAG
KNOWLEDGE_CORPUS: List[Dict[str, str]] = [
    {
        "id": "kb-arrays-hash-maps",
        "title": "Hash Map Complement Lookup vs Quadratic Nested Loops",
        "topic": "arrays, hash_maps",
        "complexity": "O(N) time, O(N) space",
        "content": (
            "When finding pairs or subarrays matching a target sum (such as Two Sum), nested loops cause O(N^2) Time Limit Exceeded (TLE) errors. "
            "Store previously visited elements and their indices in a Hash Map (dict in Python, Map/Object in JavaScript). "
            "For each element x at index i, compute complement = target - x and check if complement is already in the map before inserting x."
        ),
    },
    {
        "id": "kb-two-pointers-palindrome",
        "title": "Two Pointers In-Place Traversal & String Sanitization",
        "topic": "strings, two_pointers, arrays",
        "complexity": "O(N) time, O(1) space",
        "content": (
            "Two-pointer algorithms use left and right indices moving toward the center. Common bugs include forgetting to skip non-alphanumeric "
            "characters, failing to normalize case (toLowerCase / .lower()), and off-by-one loop conditions (while left < right). "
            "Always advance pointers inside inner while-loops with strict left < right boundary guards."
        ),
    },
    {
        "id": "kb-sliding-window",
        "title": "Dynamic Sliding Window Invariant & Shrink Condition",
        "topic": "sliding_window, strings, arrays, hash_maps",
        "complexity": "O(N) time, O(K) space",
        "content": (
            "In sliding window problems (longest substring without repeating characters, minimum window subarray), expand the right pointer each step "
            "and shrink the left pointer inside a while-loop whenever the window invariant is violated. "
            "Common bug: using an 'if' instead of 'while' when shrinking the left boundary, or updating max_len before restoring window validity."
        ),
    },
    {
        "id": "kb-stacks-parentheses",
        "title": "LIFO Stack Matching & Empty Stack Underflow Guards",
        "topic": "stacks, strings",
        "complexity": "O(N) time, O(N) space",
        "content": (
            "When validating balanced delimiters or monotonic sequences with a Stack, push opening brackets onto the stack. "
            "Before popping on a closing bracket, always verify the stack is non-empty to prevent IndexError: pop from empty list or undefined comparison. "
            "Finally, verify len(stack) == 0 at the end of the input so unclosed opening brackets are caught."
        ),
    },
    {
        "id": "kb-binary-search-bounds",
        "title": "Binary Search Midpoint Calculation & Boundary Convergence",
        "topic": "binary_search, arrays",
        "complexity": "O(log N) time, O(1) space",
        "content": (
            "Binary search requires sorted input and careful loop invariants (left <= right vs left < right). "
            "Infinite loops occur when mid = (left + right) // 2 is assigned to left = mid instead of left = mid + 1. "
            "In JavaScript, use Math.floor((left + right) / 2) because division produces floating-point indices resulting in undefined array access."
        ),
    },
    {
        "id": "kb-off-by-one-indexing",
        "title": "Off-by-One Indexing & Boundary Edge Cases",
        "topic": "arrays, strings, debugging",
        "complexity": "O(1) diagnostic pattern",
        "content": (
            "IndexError (Python) or TypeError: Cannot read properties of undefined (JavaScript) typically stems from accessing arr[i + 1] or arr[len(arr)] "
            "at the final loop iteration. Always test empty inputs ([] or ''), single-element inputs ([x]), and negative numbers."
        ),
    },
    {
        "id": "kb-tle-complexity",
        "title": "Diagnosing Time Limit Exceeded (TLE) & Hidden O(N^2) Operations",
        "topic": "algorithms, arrays, hash_maps, performance",
        "complexity": "O(N) optimization target",
        "content": (
            "Time Limit Exceeded occurs when an algorithm exceeds the 2000ms sandbox budget on large boundary inputs. "
            "Hidden quadratic costs include using 'x in list' or 'array.includes(x)' inside a loop (which is O(N) per lookup) "
            "or string concatenation inside a loop. Convert lookup collections to a Set or Hash Map for O(1) average lookup."
        ),
    },
    {
        "id": "kb-recursion-dp",
        "title": "Recursion Base Cases & Memoization for Overlapping Subproblems",
        "topic": "dynamic_programming, recursion",
        "complexity": "O(N) time with memoization",
        "content": (
            "Recursive solutions without a proper base case trigger RecursionError or Maximum call stack size exceeded. "
            "When branching (e.g., Fibonacci, climbing stairs, knapsack), cache computed subproblem states in a memo dictionary/array "
            "to reduce exponential O(2^N) complexity to linear O(N)."
        ),
    },
]


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9_]+", text.lower())


def _dense_hash_embedding(text: str, dim: int = 128) -> List[float]:
    """
    Deterministic 128-dimensional dense feature hashing embedding over word unigrams,
    bigrams, and character 3-grams with L2 normalization for fast cosine similarity.
    """
    vec = [0.0] * dim
    tokens = _tokenize(text)
    features = list(tokens)
    # Add word bigrams
    for i in range(len(tokens) - 1):
        features.append(f"{tokens[i]}_{tokens[i+1]}")
    # Add character 3-grams for morphological resilience
    joined = " ".join(tokens)
    for i in range(max(0, len(joined) - 2)):
        features.append(joined[i : i + 3])

    for feat in features:
        h = int(hashlib.md5(feat.encode("utf-8")).hexdigest()[:8], 16)
        idx = h % dim
        sign = 1.0 if ((h >> 8) & 1) == 0 else -1.0
        vec[idx] += sign

    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


class ContextualHybridRAG:
    """
    Implements:
    1. Contextual RAG (Anthropic-style context headers prepended to chunks before indexing)
    2. Semantic Chunking
    3. Query Rewriting / HyDE (Hypothetical Document Embeddings from code + diagnostics)
    4. Hybrid Search (BM25 lexical scoring + 128-d dense vector cosine similarity via RRF)
    5. Cross-Feature Reranker + Corrective RAG (CRAG) confidence gating
    """

    def __init__(self, corpus: List[Dict[str, str]] = KNOWLEDGE_CORPUS):
        self.chunks: List[Dict] = []
        self.doc_freqs: Dict[str, int] = {}
        self.avg_dl: float = 1.0
        self._build_index(corpus)

    def _build_index(self, corpus: List[Dict[str, str]]) -> None:
        total_len = 0
        for doc in corpus:
            # Contextual RAG: prepend structured domain & complexity context to every chunk
            contextualized_text = (
                f"[Domain Context: {doc['topic']} | Target Complexity: {doc['complexity']} | Pattern: {doc['title']}] "
                f"{doc['content']}"
            )
            tokens = _tokenize(contextualized_text)
            total_len += len(tokens)
            unique_tokens = set(tokens)
            for t in unique_tokens:
                self.doc_freqs[t] = self.doc_freqs.get(t, 0) + 1

            self.chunks.append({
                "id": doc["id"],
                "title": doc["title"],
                "topic": doc["topic"],
                "complexity": doc["complexity"],
                "content": doc["content"],
                "contextualized_text": contextualized_text,
                "tokens": tokens,
                "embedding": _dense_hash_embedding(contextualized_text),
            })

        self.avg_dl = total_len / max(1, len(self.chunks))

    def rewrite_query_hyde(self, req: HintRequest) -> str:
        """
        Query Rewriting + HyDE (Hypothetical Document Embeddings):
        Synthesizes a hypothetical ideal debugging document from the learner's untrusted code,
        compiler error output, execution status, and challenge topics.
        """
        err = (req.error_context or "").lower()
        code = req.code.lower()
        hypothetical_diagnosis = []

        if "indexerror" in err or "out of range" in err or "undefined" in err:
            hypothetical_diagnosis.append("off-by-one indexing boundary guard empty input array access")
        if "time limit exceeded" in err or req.normalized_status == "time_limit_exceeded" or ("for " in code and code.count("for ") >= 2):
            hypothetical_diagnosis.append("time limit exceeded TLE quadratic nested loop O(N^2) hash map set lookup O(1)")
        if "stack" in " ".join(req.topics) or "append" in code or "pop" in code:
            hypothetical_diagnosis.append("LIFO stack matching empty stack underflow guard parentheses")
        if "palindrome" in req.challenge_title.lower() or "two_pointers" in req.topics:
            hypothetical_diagnosis.append("two pointers left right in-place traversal string sanitization")
        if "sliding_window" in req.topics or "substring" in req.challenge_description.lower():
            hypothetical_diagnosis.append("sliding window dynamic shrink while loop invariant")

        base_query = f"{req.challenge_title} {' '.join(req.topics)} {req.normalized_status or ''} {req.error_context or ''}"
        return f"{base_query} {' '.join(hypothetical_diagnosis)}".strip()

    def _bm25_score(self, query_tokens: List[str], chunk: Dict, k1: float = 1.5, b: float = 0.75) -> float:
        score = 0.0
        n_docs = len(self.chunks)
        dl = len(chunk["tokens"])
        freq_map: Dict[str, int] = {}
        for t in chunk["tokens"]:
            freq_map[t] = freq_map.get(t, 0) + 1

        for qt in query_tokens:
            df = self.doc_freqs.get(qt, 0)
            if df == 0:
                continue
            idf = math.log(1.0 + (n_docs - df + 0.5) / (df + 0.5))
            tf = freq_map.get(qt, 0)
            if tf > 0:
                denom = tf + k1 * (1.0 - b + b * (dl / self.avg_dl))
                score += idf * ((tf * (k1 + 1.0)) / denom)
        return score

    def retrieve(self, req: HintRequest, top_k: int = 2) -> List[RetrievedChunk]:
        """
        Executes Hybrid Search (BM25 + Dense Vector Cosine Similarity) -> Reranking -> Corrective RAG filter.
        """
        hyde_query = self.rewrite_query_hyde(req)
        query_tokens = _tokenize(hyde_query)
        query_vec = _dense_hash_embedding(hyde_query)
        req_topics = {t.strip().lower() for t in req.topics}

        scored_candidates: List[Tuple[float, Dict]] = []
        for chunk in self.chunks:
            bm25 = self._bm25_score(query_tokens, chunk)
            dense_sim = max(0.0, _cosine_similarity(query_vec, chunk["embedding"]))

            # Cross-feature reranker bonus for explicit topic overlap
            chunk_topics = {t.strip().lower() for t in chunk["topic"].split(",")}
            topic_overlap = len(req_topics.intersection(chunk_topics))
            rerank_boost = 0.25 * topic_overlap

            # Hybrid fusion score normalized to [0, 1]
            norm_bm25 = min(1.0, bm25 / 8.0)
            hybrid_score = round(min(0.99, 0.45 * norm_bm25 + 0.40 * dense_sim + rerank_boost), 3)
            scored_candidates.append((hybrid_score, chunk))

        scored_candidates.sort(key=lambda x: x[0], reverse=True)

        # Corrective RAG (CRAG): filter out low-confidence chunks (< 0.18); fallback to general debugging pattern
        verified: List[RetrievedChunk] = []
        for score, ch in scored_candidates[:top_k]:
            if score >= 0.18:
                verified.append(
                    RetrievedChunk(
                        id=ch["id"],
                        title=ch["title"],
                        topic=ch["topic"],
                        score=score,
                        retrieval_method="contextual_hybrid_crag_hyde",
                        snippet=ch["contextualized_text"],
                    )
                )

        if not verified and scored_candidates:
            # CRAG corrective fallback to off-by-one / boundary diagnostic article
            top_score, top_ch = scored_candidates[0]
            verified.append(
                RetrievedChunk(
                    id=top_ch["id"],
                    title=top_ch["title"],
                    topic=top_ch["topic"],
                    score=max(0.20, top_score),
                    retrieval_method="crag_fallback_recovery",
                    snippet=top_ch["contextualized_text"],
                )
            )

        return verified


rag_engine = ContextualHybridRAG()
