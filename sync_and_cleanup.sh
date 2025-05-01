#!/bin/bash

# 설정 (samconfig.toml에 기본값 정의)
# STACK_NAME="gist-library-reservation-be"
# REGION="ap-northeast-2"  # 필요한 경우 리전 변경

echo "🔄 SAM sync 시작: 스택 이름 = $STACK_NAME"

# 1. SAM Sync (코드/리소스를 스택에 반영)
sam sync

if [ $? -ne 0 ]; then
  echo "❌ SAM sync 실패. 스크립트를 중단합니다."
  exit 1
fi

echo "⏳ 테스트가 끝나 스택을 삭제합니다..."

# 2. 스택 삭제
echo ""
echo "🧹 스택 삭제 중: $STACK_NAME"
aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$REGION"

echo "⌛ 스택 삭제 명령 전송 완료. 삭제가 완료될 때까지 몇 분 정도 걸릴 수 있습니다."