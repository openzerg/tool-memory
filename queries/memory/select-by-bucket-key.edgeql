SELECT MemoryEntry { id, key, value }
FILTER .bucketName = <str>$bucketName AND .key = <str>$key
LIMIT 1
