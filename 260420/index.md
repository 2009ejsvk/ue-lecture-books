---
title: 260420 몬스터 사망 후 랙돌, 아이템 박스, 드롭 연출까지 닫는 후반 파이프라인
---

# 260420 몬스터 사망 후 랙돌, 아이템 박스, 드롭 연출까지 닫는 후반 파이프라인

[← 260417](../260417/) | [루트 허브](../index.md) | [260421 →](../260421/)

## 문서 개요

`260420`의 핵심은 몬스터가 죽는 장면 하나를 만드는 데 있지 않고, 사망 이후 남아야 할 정리와 보상을 하나의 순서로 묶는 데 있다.

이번 날짜의 전체 흐름은 아래 한 줄로 요약할 수 있다.

`TakeDamage -> Death 애니메이션 -> AnimNotify_Death -> Ragdoll -> EndPlay -> ItemBox -> Drop -> Overlap`

현재 branch에서는 같은 후반 파이프라인이 아래처럼 이어진다.

`AMonsterBase / AMonsterGAS -> Death() -> SetLifeSpan() -> EndPlay() -> AItemBox::BeginPlay() -> Tick() -> ItemOverlap()`

## 학습 순서

1. [01 Monster Death와 사망 상태 정리](./01_intermediate_monster_death_and_state_shutdown/)
2. [02 Ragdoll과 ItemBox 스폰 파이프라인](./02_intermediate_ragdoll_and_itembox_spawn_pipeline/)
3. [03 ItemBox Drop 효과와 획득 오버랩](./03_intermediate_itembox_drop_effect_and_overlap/)
4. [04 공식 문서 부록](./04_appendix_official_docs_reference/)
5. [05 현재 프로젝트 C++ 부록](./05_appendix_current_project_cpp_reference/)

## 이번 분권에서 보강한 내용

- 기존 통합 문서를 `Death`, `Ragdoll/ItemBox`, `Drop 효과`, `공식 문서`, `현재 프로젝트 C++` 다섯 편으로 분리했다.
- 기존 이미지 11장을 각 편의 설명 흐름에 맞게 다시 배치했다.
- 강의 캡처에서 `EndPlay 설명`, `ItemBox 스폰 화면`, `Drop 회전 튜닝` 컷 3장을 새로 추가했다.
- 현재 branch 기준으로 `AMonsterGAS::Death()`와 `AMonsterGAS::EndPlay()`가 legacy 후반 파이프라인을 거의 그대로 재사용한다는 점을 문서에 반영했다.
- 반대로 `AMonsterGAS::TakeDamage()`는 아직 예전 직접 HP 차감 코드가 주석 상태라는 점도 같이 정리했다.

## 현재 branch 추적 메모

강의 원형은 `AMonsterBase` 축에서 시작하지만, 지금 저장소를 보면 `260420`의 후반 레이어는 GAS 쪽에서도 그대로 남아 있다.

- 사망 후 물리 전환: `AMonsterBase::Death()`, `AMonsterGAS::Death()`
- 액터 종료 시 드롭 생성: `AMonsterBase::EndPlay()`, `AMonsterGAS::EndPlay()`
- 드롭 액터 본체: `AItemBox`
- 실제 드롭 연출: `BeginPlay()`, `StartDropAnimation()`, `FindGroundLocation()`, `Tick()`, `ItemOverlap()`

즉 이 날짜는 legacy 전용 사망 연출 설명이 아니라, 지금 branch에서도 재사용되는 공통 후반 파이프라인을 읽는 날에 가깝다.

## 핵심 문장

`260420`의 본질은 죽는 모션 하나를 추가하는 데 있지 않고, 전투가 끝난 뒤 월드에 남을 처리와 보상을 안전하게 넘기는 데 있다.

## 자료

- 원본 영상: `D:\UE_Academy_Stduy_compressed\260420_1~3`
- 실제 코드: `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- 덤프 자료: `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 다음 단계

다음 날짜 [260421](../260421/)부터는 플레이어 GAS 축으로 이동하면서, 이번에 정리한 사망/보상 후반부와 다른 방식의 능력 파이프라인을 읽게 된다.

[← 260417](../260417/) | [루트 허브](../index.md) | [260421 →](../260421/)
