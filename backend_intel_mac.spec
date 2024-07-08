# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['py_src/py_backend.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=['backends'],
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
    optimize=1,
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
