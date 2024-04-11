# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['py_src/py_backend.py'],
    pathex=[],
    binaries=[('.venv/lib/python3.12/site-packages/mlx/lib/mlx.metallib', 'mlx/lib')],
    datas=[
    ('py_src/vendor/whisper/whisper/assets/mel_filters.npz', 'vendor/whisper/whisper/assets'),
    ('py_src/vendor/whisper/whisper/assets/multilingual.tiktoken', 'vendor/whisper/whisper/assets'),
    ('py_src/vendor/whisper/whisper/assets/gpt2.tiktoken', 'vendor/whisper/whisper/assets'),
    ],
    hiddenimports=['backends', 'mlx._reprlib_fix', 'mlx._os_warning'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='py_backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=True,
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
    name='py_backend',
)
