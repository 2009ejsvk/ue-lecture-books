---
title: 260407 부록 1 - 공식 문서로 다시 읽는 애님 구조
---

# 부록 1. 공식 문서로 다시 읽는 애님 구조

[이전: 중급 3편](../04_intermediate_jump_state_machine_and_cached_pose/) | [허브](../) | [다음: 부록 2](../06_appendix_current_project_cpp_reference/)

## 이 부록의 목표

이 부록에서는 `260407`에서 배운 애님 변수, `Aim Offset`, `Blend Space`, `State Machine` 구조를 언리얼 공식 문서의 표준 용어와 연결한다.
즉 애님 블루프린트가 어떤 자산과 그래프 조합으로 움직이는지 자습용 동선을 잡아 주는 편이다.

## 먼저 보면 좋은 공식 문서

- [Animation Blueprint Editor in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-editor-in-unreal-engine?application_version=5.6)
- [How to Get Animation Variables in Animation Blueprints in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/how-to-get-animation-variables-in-animation-blueprints-in-unreal-engine?application_version=5.6)
- [Blend Spaces in Animation Blueprints in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/blend-spaces-in-animation-blueprints-in-unreal-engine?application_version=5.6)
- [Locomotion Based Blending in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/locomotion-based-blending-in-unreal-engine)
- [Creating an Aim Offset in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/creating-an-aim-offset-in-unreal-engine)
- [Adding Character Animation in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/adding-character-animation-in-unreal-engine)

## `Animation Blueprint`와 `Animation Variables` 문서는 강의의 중간 레이어 개념을 더 선명하게 만든다

공식 문서도 애니메이션을 아래 두 층으로 나눠 설명한다.

- `Event Graph`
  속도, 공중 여부, 회전량 같은 상태값 계산
- `Anim Graph`
  그 값을 이용해 최종 포즈 생성

즉 강의의 `mMoveSpeed`, `mViewPitch`, `mViewYaw`, `mIsInAir`, `mYawDelta`, `mAccelerating`는 단순 변수 목록이 아니라, `Event Graph`가 `Anim Graph`에 넘기는 공식 입력값 집합으로 이해하면 된다.

## `Aim Offset`, `Blend Space`, `State Machine`은 서로 다른 문제를 푼다

입문자가 가장 헷갈리기 쉬운 부분이 이 셋이 모두 "애니메이션을 섞는 것처럼" 보인다는 점이다.
공식 문서 기준으로는 역할이 꽤 분명하게 갈린다.

- `Aim Offset`
  시선/조준 방향 보정
- `Blend Space`
  속도나 축 값에 따른 이동 포즈 보간
- `State Machine`
  `Idle -> Run -> JumpStart -> JumpLand` 같은 상태 흐름 관리

![Aim Offset 자산 편집](../assets/images/aimoffset-asset.jpg)

즉 `260407`의 강의 흐름 자체가 엔진 표준 구조와 거의 같다.

## 추천 읽기 순서

1. `Animation Blueprint Editor`로 에디터 구조를 먼저 본다.
2. `Animation Variables`로 상태 변수 계산 흐름을 본다.
3. `Blend Spaces`와 `Locomotion Based Blending`으로 이동 보간을 본다.
4. `Creating an Aim Offset`으로 시선 보정을 본다.
5. `Adding Character Animation`으로 점프/상태 머신 연결을 다시 본다.

## 이 부록의 핵심 정리

1. `260407`은 공식 문서 기준으로도 매우 정석적인 애님 파이프라인 입문이다.
2. 애님 변수, `Aim Offset`, `Blend Space`, `State Machine`은 역할이 겹치는 개념이 아니다.
3. 공식 문서를 함께 읽으면 뒤의 몽타주, 슬롯, 노티파이 파트까지 연결이 훨씬 쉬워진다.

## 다음 편

[부록 2. 현재 프로젝트 C++로 다시 읽는 애님 파이프라인](../06_appendix_current_project_cpp_reference/)
