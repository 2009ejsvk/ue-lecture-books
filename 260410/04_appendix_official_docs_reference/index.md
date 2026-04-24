---
title: 260410 04 공식 문서로 다시 읽는 투사체, 데칼, 캐스팅 구조
---

# 260410 04 공식 문서로 다시 읽는 투사체, 데칼, 캐스팅 구조

[이전: 03 스킬 캐스팅](../03_intermediate_skill_casting_motion_and_upper_body_blend/) | [260410 허브](../) | [다음: 05 현재 프로젝트 C++](../05_appendix_current_project_cpp_reference/)

## 왜 공식 문서를 같이 보는가

`260410`은 전투 표현 계층이 여러 갈래로 갈라지는 날이다.
투사체, 데칼, 상하체 분리, 스킬 몽타주가 한꺼번에 나오기 때문에, 엔진 표준 용어로 다시 정리해 두면 이후 날짜들이 훨씬 덜 헷갈린다.

## 이번 날짜와 직접 맞닿는 공식 문서 키워드

1. `Skeletal Mesh Sockets`
2. `Projectile Movement Component`
3. `Decal Materials`
4. `Using Layered Animations`
5. `Animation Montage`
6. `Animation Notifies`

## 어떻게 연결해서 읽으면 좋은가

### 1. `Skeletal Mesh Sockets`

왜 총알 발사 기준점을 캐릭터 전방 임의 위치가 아니라 `Muzzle_01` 같은 소켓으로 잡아야 하는지 이해하게 해 준다.

### 2. `Projectile Movement Component`

직접 Tick으로 이동 로직을 짜지 않고, `ProjectileMovement`로 직선 탄도와 속도를 관리하는 이유를 정리해 준다.

### 3. `Decal Materials`

총알 자국과 마법진이 왜 파티클이 아니라 데칼 계층으로 설명되는지 이해하기 좋다.

### 4. `Using Layered Animations`

상하체 분리, `Layered Blend Per Bone`, `Spine_01` 기준 브랜치 필터가 왜 필요한지 감을 잡게 해 준다.

### 5. `Animation Montage`, `Animation Notifies`

`PlaySkill1()`, 섹션 재생, `AnimNotify_SkillCasting()`, 종료 콜백 구조를 엔진 표준 용어로 다시 읽게 해 준다.

## 추천 읽기 순서

1. `Skeletal Mesh Sockets`
2. `Projectile Movement Component`
3. `Decal Materials`
4. `Using Layered Animations`
5. `Animation Montage`
6. `Animation Notifies`

이 순서대로 보면 `발사 기준점 -> 이동 -> 표면 흔적 -> 캐스팅 포즈 -> 스킬 타이밍`이 자연스럽게 이어진다.

## 한 줄 정리

공식 문서 기준으로 다시 보면 `260410`은 `투사체`, `표면 흔적`, `캐스팅 포즈`를 각각 독립된 시스템으로 분리해 배우는 날이다.

[이전: 03 스킬 캐스팅](../03_intermediate_skill_casting_motion_and_upper_body_blend/) | [260410 허브](../) | [다음: 05 현재 프로젝트 C++](../05_appendix_current_project_cpp_reference/)
