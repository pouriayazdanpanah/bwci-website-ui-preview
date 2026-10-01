#!/usr/bin/env python3
"""Dev-only: pixel-diff two screenshot folders (w<width>.png). Usage: diff.py <refDir> <testDir> [outDir]"""
import sys, os
import numpy as np
from PIL import Image
ref, test = sys.argv[1], sys.argv[2]
out = sys.argv[3] if len(sys.argv) > 3 else None
if out: os.makedirs(out, exist_ok=True)
for f in sorted(os.listdir(ref), key=lambda s: int(s[1:-4])):
    a = np.asarray(Image.open(os.path.join(ref, f)).convert('RGB')).astype(int)
    b = np.asarray(Image.open(os.path.join(test, f)).convert('RGB')).astype(int)
    if a.shape != b.shape:
        print(f, 'SIZE MISMATCH', a.shape, b.shape); continue
    d = np.abs(a - b).max(axis=2)
    bad = d > 24
    rows = np.where(bad.any(axis=1))[0]
    print(f"{f:10s} diff-pixels={bad.mean()*100:6.3f}%  rows={len(rows)}" + (f"  y-range={rows.min()}..{rows.max()}" if len(rows) else ''))
    if out and len(rows):
        m = Image.fromarray((bad * 255).astype('uint8'))
        m.save(os.path.join(out, f))
