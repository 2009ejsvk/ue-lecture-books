---
title: 260414 몬스터 본체, 감지, 비헤이비어 트리, 블랙보드, 데이터 관리까지 AI 기반을 세우는 날
---

# 260414 몬스터 본체, 감지, 비헤이비어 트리, 블랙보드, 데이터 관리까지 AI 기반을 세우는 날

[← 260413](../260413/) | [루트 허브](../index.md) | [260415 →](../260415/)

## 문서 개요

`260414`는 몬스터 AI를 "공격 기술"부터 만들지 않고, 그 기술이 올라갈 바닥 구조부터 세우는 날이다.
이번 날짜의 핵심 흐름은 아래 한 줄로 요약된다.

`MonsterBase -> AIController / Perception -> Behavior Tree / Blackboard -> DataTable -> AssetManager`

현재 branch 기준으로 다시 쓰면 같은 뼈대가 아래처럼 이어진다.

`MonsterGAS -> MonsterGASController / ASC / AttributeSet -> Behavior Tree / Blackboard -> DataTable -> AssetManager`

즉 이 날짜는 이후 순찰, 추적, 공격, GAS 데미지 루프까지 올라갈 기반 시스템을 여는 출발점이다.

## 학습 순서

1. [01 MonsterBase와 Pawn 구조](./01_intermediate_monsterbase_and_pawn_structure/)
2. [02 AIController, AIPerception, NavMesh](./02_intermediate_aicontroller_perception_and_navmesh/)
3. [03 Behavior Tree, Blackboard, MonsterState, DataTable](./03_intermediate_behaviortree_blackboard_monsterstate_and_datatable/)
4. [04 AssetManager와 데이터 로딩](./04_intermediate_assetmanager_and_data_loading/)
5. [05 공식 문서 부록](./05_appendix_official_docs_reference/)
6. [06 현재 프로젝트 C++ 부록](./06_appendix_current_project_cpp_reference/)

## 이번 분권에서 보강한 내용

- 기존 통합 문서를 `MonsterBase`, `AIController`, `Behavior Tree/DataTable`, `AssetManager`, `공식 문서`, `현재 프로젝트 C++` 여섯 편으로 분리했다.
- 기존 이미지 10장을 각 편의 설명 흐름에 맞게 재배치했다.
- 강의 캡처에서 `MonsterBase 생성자 코드`, `NavMesh 런타임`, `DT_MonsterInfo 확인`, `AssetManager 로딩 결과` 컷 4장을 새로 추가했다.
- 현재 branch 기준으로 `AMonsterGAS`, `AMonsterGASController`, `UMonsterAttributeSet`, `UAssetGameInstanceSubsystem` 연결을 함께 보강했다.

## 현재 branch 추적 메모

`260414`의 원형 구조는 지금도 거의 그대로 살아 있다.

- legacy 축: `AMonsterBase`, `AMonsterController`, `AMonsterNormal`, `IMonsterState`
- 현재 축: `AMonsterGAS`, `AMonsterGASController`, `UAbilitySystemComponent`, `UMonsterAttributeSet`

핵심 차이는 뼈대가 아니라 `런타임 수치 저장 위치`다.
예전 강의에서는 `MonsterState`가 체력, 공격력, 이동 속도, 감지 거리를 직접 저장했다면, 현재 branch에서는 그 역할의 상당 부분이 `AttributeSet`으로 옮겨 갔다.
그래도 `Pawn 본체 -> 감지 -> Blackboard/Behavior Tree -> DataTable -> AssetManager`라는 설계 순서는 그대로다.

## 핵심 문장

`260414`의 본질은 몬스터 하나를 완성하는 것이 아니라, 몬스터 AI 시스템이 올라갈 공통 바닥을 세우는 데 있다.

## 자료

- 원본 영상: `D:\UE_Academy_Stduy_compressed\260414_1~4`
- 실제 코드: `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- 덤프 자료: `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 다음 단계

다음 날짜 [260415](../260415/)부터는 지금 만든 기반 위에 `MonsterNormal`, `SpawnPoint`, `Patrol`, `Behavior Tree 실행` 쪽이 본격적으로 올라가기 시작한다.

[← 260413](../260413/) | [루트 허브](../index.md) | [260415 →](../260415/)
