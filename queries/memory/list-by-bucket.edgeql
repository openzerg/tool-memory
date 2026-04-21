SELECT MemoryEntry { key, updatedAt }
FILTER .bucketName = <str>$bucketName
ORDER BY .updatedAt DESC
