---
title: 260410 Wraith 총알, 데칼, Shinbi 스킬 캐스팅으로 공격 표현 계층 확장하기
---

# 260410 Wraith 총알, 데칼, Shinbi 스킬 캐스팅으로 공격 표현 계층 확장하기

[← 260409](../260409/) | [루트 허브](../index.md) | [260413 →](../260413/)

## 문서 개요

`260410`은 전날 만든 `판정 + 데미지 + 피드백` 구조를 조금 더 "보이게" 만드는 날이다.
핵심은 세 갈래다.

1. `Wraith`의 원거리 공격을 총구 소켓 기반 투사체로 정리한다.
2. 총알 자국과 마법진처럼 표면에 남는 정보를 `Decal` 계층으로 분리한다.
3. `Shinbi` 스킬을 상하체 분리와 캐스팅 몽타주 구조로 올린다.

즉 이번 날짜는 전투 시스템을 더 세게 만드는 날이 아니라, `공격 표현 파이프라인`을 더 정교하게 만드는 날에 가깝다.

## 학습 순서

1. [01 Wraith 총알과 총구 소켓](./01_intermediate_wraith_projectile_and_muzzle_socket/)
2. [02 데칼 액터와 표면 흔적](./02_intermediate_decal_actor_and_surface_feedback/)
3. [03 스킬 캐스팅 모션과 상하체 분리](./03_intermediate_skill_casting_motion_and_upper_body_blend/)
4. [04 공식 문서 부록](./04_appendix_official_docs_reference/)
5. [05 현재 프로젝트 C++ 부록](./05_appendix_current_project_cpp_reference/)

## 이번 분권에서 보강한 내용

- 기존 통합 문서를 `총알 공격`, `데칼`, `스킬 캐스팅`, `공식 문서`, `현재 프로젝트 C++` 다섯 편으로 분리했다.
- 기존 이미지 10장을 각 주제 문맥에 맞게 재배치했다.
- 강의 캡처에서 대표 컷 3장을 추가해 `Wraith 히트 플레이테스트`, `데칼 표면 미리보기`, `Shinbi 캐스팅 포즈`를 보강했다.
- 현재 branch 기준으로 `UPlayerAnimInstance`와 `UPlayerTemplateAnimInstance`가 `APlayerCharacterGAS` 라인을 기준으로 동작한다는 점, 반면 `WraithBullet`, `DecalBase`, `Shinbi::Skill1Casting()` 구조는 여전히 legacy 설명이 가장 직관적이라는 점을 함께 반영했다.

## 현재 branch 추적 메모

`260410` 설명은 여전히 유효하지만, 현재 저장소에는 두 층이 함께 있다.

- legacy 플레이어 라인: `APlayerCharacter`, `AShinbi`, `AWraith`
- GAS 플레이어 라인: `APlayerCharacterGAS`, `AShinbiGAS`, `AWraithGAS`

특히 `Wraith` 총알 구조와 `DecalBase`는 두 라인에서 거의 그대로 재사용된다.
반면 `Shinbi`의 스킬 캐스팅 흐름은 legacy 쪽이 교안 맥락을 가장 잘 보여 주고, `ShinbiGAS` 쪽은 일부 공격 확정 분기가 주석 처리된 상태다.

## 핵심 문장

`260410`의 본질은 전투 결과를 더 화려하게 만드는 것이 아니라, `어디서 시작되고 어떤 표면에 남으며 어떤 포즈로 준비되는가`를 시스템으로 분리하는 데 있다.

## 자료

- 원본 영상: `D:\UE_Academy_Stduy_compressed\260410_1~3`
- 실제 코드: `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- 덤프 자료: `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 다음 단계

다음 날짜 [260413](../260413/)에서는 여기서 만든 데칼과 캐스팅 구조가 마우스 피킹, 위치 지정형 스킬, Geometry Collection 파괴와 본격적으로 연결된다.

[← 260409](../260409/) | [루트 허브](../index.md) | [260413 →](../260413/)
