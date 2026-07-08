"""手机号加解密工具（cryptography.fernet）

加密密钥优先从环境变量 PHONE_ENCRYPTION_KEY 读取；
首次运行时若未设置，自动生成并打印到日志（开发便捷，生产环境务必固定）。
"""

from __future__ import annotations

import base64
import logging
import os

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

logger = logging.getLogger(__name__)

_SALT = b"chat_web_phone_salt_2024"  # 固定盐值，生产环境可改为环境变量


def _get_key() -> bytes:
    """获取 Fernet 密钥：优先环境变量，否则自动生成。"""
    env_key = os.environ.get("PHONE_ENCRYPTION_KEY")
    if env_key:
        return env_key.encode("utf-8")

    # 自动生成（首次运行）
    key = Fernet.generate_key()
    logger.warning(
        "⚠️  PHONE_ENCRYPTION_KEY 未设置，已自动生成（重启后失效）: %s",
        key.decode(),
    )
    return key


def _derive_fernet_key(raw: bytes) -> bytes:
    """将任意长度的密钥材料派生为 Fernet 兼容的 32 字节 URL-safe base64 密钥。"""
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=_SALT, iterations=480000)
    return base64.urlsafe_b64encode(kdf.derive(raw))


def _get_fernet() -> Fernet:
    key = _get_key()
    fernet_key = _derive_fernet_key(key)
    return Fernet(fernet_key)


def encrypt_phone(plaintext: str) -> str:
    """加密手机号，返回 base64 密文字符串。"""
    if not plaintext:
        return ""
    f = _get_fernet()
    return f.encrypt(plaintext.encode("utf-8")).decode("utf-8")


def decrypt_phone(ciphertext: str) -> str:
    """解密手机号，返回明文字符串。解密失败返回空字符串。"""
    if not ciphertext:
        return ""
    f = _get_fernet()
    try:
        return f.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
    except Exception:
        logger.exception("手机号解密失败")
        return ""
