# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['py_src/py_backend.py'],
    pathex=[],
    binaries=[('.venv/lib/python3.12/site-packages/mlx/lib/mlx.metallib', 'mlx/lib')],
    datas=[
    ('.venv/lib/python3.12/site-packages/mlx_whisper/assets/mel_filters.npz', 'mlx_whisper/assets'),
    ('.venv/lib/python3.12/site-packages/mlx_whisper/assets/multilingual.tiktoken', 'mlx_whisper/assets'),
    ('.venv/lib/python3.12/site-packages/mlx_whisper/assets/gpt2.tiktoken', 'mlx_whisper/assets'),
    ],
    hiddenimports=['backends', 'mlx._reprlib_fix', 'mlx._os_warning'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
     'pip',
     'pyinstaller',
     'pyinstaller-hooks-contrib',
     'pyyaml',
     'setuptools',
    ],
    noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='logia_backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='backend',
)
