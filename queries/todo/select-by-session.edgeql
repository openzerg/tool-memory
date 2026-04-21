SELECT TodoEntry { content, status, priority }
FILTER .sessionId = <str>$sessionId
ORDER BY .position ASC
