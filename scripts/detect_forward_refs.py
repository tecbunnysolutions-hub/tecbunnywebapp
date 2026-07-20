from pathlib import Path
import re

p = Path('supabase/migrations/20260715000000_baseline.sql')
text = p.read_text(encoding='utf-8')

create_pat = re.compile(r"CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(?:public\.)?([A-Za-z0-9_]+)\s*\(", re.I)
creates = []
for m in create_pat.finditer(text):
    creates.append((m.group(1), m.start()))

# build map of table -> index
order = {name: idx for idx, (name, pos) in enumerate(creates)}

# find end positions by next create or end
ends = {}
for i, (name, pos) in enumerate(creates):
    start = pos
    if i+1 < len(creates):
        end = creates[i+1][1]
    else:
        end = len(text)
    ends[name] = (start, end)

ref_pat = re.compile(r"REFERENCES\s+(?:public\.)?([A-Za-z0-9_]+)\b", re.I)

forward_refs = []
for tbl, (start,end) in ends.items():
    chunk = text[start:end]
    for m in ref_pat.finditer(chunk):
        ref = m.group(1)
        if ref in order and order[ref] > order[tbl]:
            forward_refs.append((tbl, ref))

print('TOTAL_TABLES', len(creates))
print('FORWARD_REFERENCE_COUNT', len(forward_refs))
for i, (t,r) in enumerate(forward_refs[:100],1):
    print(f'{i}. {t} -> {r}')

# Provide summary for any missing table definitions referenced
missing = set()
for m in ref_pat.finditer(text):
    ref = m.group(1)
    if ref not in order:
        # ignore auth.users and other external references
        if ref.lower() in ('auth','users','extensions'):
            continue
        missing.add(ref)
if missing:
    print('\nMISSING_TABLE_DEFS', len(missing))
    for t in sorted(missing):
        print('-', t)
else:
    print('\nMISSING_TABLE_DEFS 0')
