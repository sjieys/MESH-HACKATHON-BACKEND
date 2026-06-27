'use strict';

const AppError = require('../utils/AppError');

// 구글 idToken 검증 없이, 토큰에서 직접 payload를 디코딩하여 사용 (개발/해커톤용)
// 실제 프로덕션에서는 google-auth-library로 서명 검증 필요
async function verifyGoogleIdToken(idToken) {
  if (!idToken) {
    throw AppError.unauthorized('idToken이 필요해요');
  }

  try {
    // JWT payload 파싱 (서명 검증 생략 - 해커톤용)
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw AppError.unauthorized('올바른 토큰 형식이 아니에요');
    }

    // base64url → base64 변환 (Node 버전 무관하게 동작)
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const raw = Buffer.from(b64, 'base64').toString('utf8');
    const payload = JSON.parse(raw);

    if (!payload.sub) {
      throw AppError.unauthorized('로그인에 실패했어요. 다시 시도해 주세요');
    }

    return {
      providerId: payload.sub,
      email: payload.email || null,
      name: payload.name || null,
      picture: payload.picture || null,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.unauthorized('로그인에 실패했어요. 다시 시도해 주세요');
  }
}

// TODO: 카카오 idToken 검증 (해커톤 범위 외)
async function verifyKakaoToken(/* idToken */) {
  throw AppError.businessRule('카카오 로그인은 아직 지원하지 않아요');
}

// TODO: 네이버 idToken 검증 (해커톤 범위 외)
async function verifyNaverToken(/* idToken */) {
  throw AppError.businessRule('네이버 로그인은 아직 지원하지 않아요');
}

module.exports = { verifyGoogleIdToken, verifyKakaoToken, verifyNaverToken };
