INSERT MemoryEntry {
  bucketName := <str>$bucketName,
  key := <str>$key,
  value := <str>$value,
  createdAt := <int64>$ts,
  updatedAt := <int64>$ts,
}
UNLESS CONFLICT ON (.bucketName, .key)
ELSE (UPDATE MemoryEntry SET { value := <str>$value, updatedAt := <int64>$ts })
