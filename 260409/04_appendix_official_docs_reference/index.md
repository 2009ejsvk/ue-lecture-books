---
title: 260409 04 공식 문서로 다시 읽는 판정, 데미지, 피드백 구조
---

# 260409 04 공식 문서로 다시 읽는 판정, 데미지, 피드백 구조

[이전: 03 데미지와 투사체](../03_intermediate_damage_effects_and_projectiles/) | [260409 허브](../) | [다음: 05 현재 프로젝트 C++](../05_appendix_current_project_cpp_reference/)

## 왜 공식 문서를 같이 보는가

`260409`은 공격 판정, 데미지, 파티클, 사운드, 투사체가 한꺼번에 등장해서 기능이 갑자기 많아진 것처럼 느껴지기 쉽다.
하지만 공식 문서 기준으로 보면 이들은 전부 `Collision`, `Trace`, `OnHit`, `VFX`, `Audio`라는 엔진 표준 층으로 정리된다.

## 이번 날짜와 직접 맞닿는 공식 문서

1. [Collision in Unreal Engine - Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/collision-in-unreal-engine---overview)
2. [Using the OnHit Event](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-the-onhit-event)
3. [Using a Single Line Trace (Raycast) by Channel in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-a-single-line-trace-raycast-by-channel-in-unreal-engine)
4. [UKismetSystemLibrary::SphereTraceSingleByProfile](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Engine/Kismet/UKismetSystemLibrary/SphereTraceSingleByProfile)
5. [Creating Visual Effects in Niagara for Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/creating-visual-effects-in-niagara-for-unreal-engine)
6. [Working with Audio in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/working-with-audio-in-unreal-engine)
7. [Audio Component](https://dev.epicgames.com/documentation/en-us/unreal-engine/audio-component)

## 연결해서 읽는 법

### 1. `Collision Overview`

누가 누구를 막고, 누가 누구를 맞출 수 있는지 프로젝트 규칙으로 먼저 이해하게 해 준다.

### 2. `Trace` 계열 문서

`Shinbi`의 캡슐 Sweep 같은 근접 판정이 왜 쿼리 기반으로 읽혀야 하는지 감을 잡게 해 준다.

### 3. `OnHit Event`

원거리 탄환이 `OnComponentHit`나 `OnProjectileStop` 계열 입구를 통해 후속 로직과 이어지는 이유를 설명해 준다.

### 4. `Niagara`, `Audio`, `Audio Component`

파티클과 사운드가 단순 장식이 아니라, 전투 결과를 완성하는 별도 시스템 층이라는 점을 더 분명하게 보여 준다.

## 추천 읽기 순서

1. `Collision Overview`
2. `Trace` 문서
3. `OnHit Event`
4. `Niagara`
5. `Working with Audio`
6. `Audio Component`

이 순서대로 읽으면 `무엇이 맞았는가 -> 맞았을 때 무슨 로직이 돌까 -> 그 결과를 어떻게 보여 줄까`가 자연스럽게 이어진다.

## 한 줄 정리

공식 문서 기준으로 다시 보면 `260409`은 `충돌 규칙 -> 판정 쿼리 -> 데미지 전달 -> 시각/청각 피드백`을 하나의 엔진 파이프라인으로 배우는 날이다.

[이전: 03 데미지와 투사체](../03_intermediate_damage_effects_and_projectiles/) | [260409 허브](../) | [다음: 05 현재 프로젝트 C++](../05_appendix_current_project_cpp_reference/)
