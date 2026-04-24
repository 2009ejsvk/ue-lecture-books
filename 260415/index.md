---
title: 260415 몬스터를 스폰하고 순찰시키고 플레이어를 감지하면 추적으로 바꾸는 AI 기초
---

# 260415 몬스터를 스폰하고 순찰시키고 플레이어를 감지하면 추적으로 바꾸는 AI 기초

[← 260414](../260414/) | [루트 허브](../index.md) | [260416 →](../260416/)

## 문서 개요

`260415`의 핵심은 몬스터 한 마리의 공격을 만드는 것이 아니라, `필드 안에서 태어난 몬스터가 어떤 문맥을 함께 받고 어떻게 순찰과 추적으로 넘어가는가`를 정리하는 데 있다.

이번 날짜의 전체 흐름은 아래 한 줄로 요약할 수 있다.

`SpawnPoint -> PatrolPoints -> PossessedBy / Behavior Tree -> OnTarget -> Move To`

현재 branch 기준으로는 이 흐름이 `AMonsterSpawnPoint -> AMonsterGAS -> AMonsterGASController -> BTTask_PatrolGAS / BTTask_TraceGAS` 축으로 구현돼 있다.

## 학습 순서

1. [01 SpawnPoint와 스폰 문맥](./01_intermediate_spawnpoint_and_spawn_context/)
2. [02 Spline, PatrolPoints, Behavior Tree 등록](./02_intermediate_spline_patrolpoints_and_behavior_tree_registration/)
3. [03 타겟 인식과 Move To](./03_intermediate_target_detection_and_move_to/)
4. [04 공식 문서 부록](./04_appendix_official_docs_reference/)
5. [05 현재 프로젝트 C++ 부록](./05_appendix_current_project_cpp_reference/)

## 이번 분권에서 보강한 내용

- 기존 통합 문서를 `SpawnPoint`, `Patrol/BT`, `Target/MoveTo`, `공식 문서`, `현재 프로젝트 C++` 다섯 편으로 분리했다.
- 기존 이미지 14장을 각 편의 설명 흐름에 맞게 재배치했다.
- 강의 캡처에서 `SpawnPoint 런타임 배치`, `Spline 런타임 미리보기`, `실제 추적 런타임` 컷 3장을 새로 추가했다.
- 현재 branch 기준으로 `SpawnActor<AMonsterGAS>`, `BT_MonsterGAS_Normal`, `BTTask_PatrolGAS`, `BTTask_TraceGAS`, `MonsterAttributeSet` 흐름을 함께 보강했다.

## 현재 branch 추적 메모

강의 원형은 `MonsterBase / MonsterController / BT_Monster_Normal` 축이었지만, 현재 저장소의 실사용 흐름은 아래처럼 옮겨와 있다.

- 스폰 문맥: `AMonsterSpawnPoint`
- 공통 본체: `AMonsterGAS`
- AI 컨트롤러: `AMonsterGASController`
- 순찰/추적 태스크: `UBTTask_PatrolGAS`, `UBTTask_TraceGAS`
- 수치 저장소: `UMonsterAttributeSet`

즉 설계의 뼈대는 그대로이고, 대상 클래스와 수치 저장 위치만 GAS 기준으로 확장된 상태다.

## 핵심 문장

`260415`의 본질은 몬스터를 하나 소환하는 데 있지 않고, `스폰 문맥 -> 순찰 문맥 -> 감지 문맥 -> 추적 문맥`을 하나의 필드형 AI 루프로 연결하는 데 있다.

## 자료

- 원본 영상: `D:\UE_Academy_Stduy_compressed\260415_1~3`
- 실제 코드: `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- 덤프 자료: `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 다음 단계

다음 날짜 [260416](../260416/)부터는 지금 만든 필드형 AI 루프 위에 `추적 이후 공격`, `거리 판정`, `애니메이션과 전투 전환`이 더 본격적으로 얹히기 시작한다.

[← 260414](../260414/) | [루트 허브](../index.md) | [260416 →](../260416/)
