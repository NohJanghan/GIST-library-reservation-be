#!/bin/bash

# 오류 발생 시 스크립트 중단 설정
set -e

# samconfig.toml 파일 경로
SAMCONFIG_FILE="samconfig.toml"

# samconfig.toml 파일 존재 확인
if [ ! -f "$SAMCONFIG_FILE" ]; then
  echo -e "❌ $SAMCONFIG_FILE 파일을 찾을 수 없습니다."
  exit 1
fi

# samconfig.toml에서 stack_name 추출
STACK_NAME=$(awk -F'=' '/stack_name/ {gsub(/"/, "", $2); gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2; exit}' "$SAMCONFIG_FILE")

# stack_name 검증
if [ -z "$STACK_NAME" ]; then
  echo -e "❌ samconfig.toml에서 stack_name을 찾을 수 없습니다."
  exit 1
fi

# REGION은 AWS CLI 설정에서 가져오기
REGION=$(aws configure get region)
if [ -z "$REGION" ]; then
  echo -e "⚠️ AWS CLI에서 리전 정보를 찾을 수 없습니다. 기본값 사용."
  REGION="ap-northeast-2"
fi

echo "🔄 SAM sync 시작: 스택 이름 = $STACK_NAME, 리전 = $REGION"

# SAM Sync 실행
if ! sam sync --stack-name "$STACK_NAME" --region "$REGION"; then
  echo "❌ SAM sync 실패. 스크립트를 중단합니다."
  exit 1
fi

echo "⏳ 테스트가 끝나 스택을 삭제합니다..."

# 스택 삭제
echo "🧹 스택 삭제 중: $STACK_NAME"
aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$REGION"

echo "⌛ 스택 삭제 명령 전송 완료. 삭제가 완료될 때까지 몇 분 정도 걸릴 수 있습니다."