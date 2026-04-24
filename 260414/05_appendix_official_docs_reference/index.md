---
title: 260414 05 공식 문서 부록
---

# 260414 05 공식 문서 부록

[260414 허브](../) | [이전: 04 AssetManager와 데이터 로딩](../04_intermediate_assetmanager_and_data_loading/) | [다음: 06 현재 프로젝트 C++ 부록](../06_appendix_current_project_cpp_reference/)

## 문서 개요

`260414`부터는 강의 용어와 언리얼 공식 문서 용어가 거의 1:1로 겹친다.
그래서 이 날짜는 공식 문서를 같이 보면 강의 구조가 `프로젝트 고유한 꼼수`가 아니라, 엔진 표준 구조 위에 서 있다는 점이 훨씬 잘 보인다.

## 1. 이번 날짜와 직접 연결되는 공식 문서

- [Behavior Tree in Unreal Engine - User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide?application_version=5.6)
- [AI Perception in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-perception-in-unreal-engine)
- [Basic Navigation in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/basic-navigation-in-unreal-engine)
- [Data Driven Gameplay Elements in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/data-driven-gameplay-elements-in-unreal-engine)
- [Asset Management in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/asset-management-in-unreal-engine)

## 2. AI 쪽 공식 문서는 강의의 판단 구조를 같은 언어로 설명한다

강의 2장과 3장의 핵심 질문은 아래와 같다.

- 지금 타깃이 있는가
- 그 타깃은 누구인가
- 어떤 행동 브랜치를 타야 하는가

공식 문서도 정확히 같은 분업을 설명한다.

- `AI Perception`: 월드에서 감지 정보를 받아온다
- `Blackboard`: 현재 기억해야 할 키 값을 저장한다
- `Behavior Tree`: 그 기억값을 바탕으로 행동을 고른다

즉 `MonsterController::OnTarget()`, `BB_Monster_Base`, `BT_Monster_Normal` 구조는 강의 전용 우회법이 아니라 언리얼 표준 AI 파이프라인과 같은 방향이다.

## 3. 데이터 쪽 공식 문서는 왜 `DataTable`만으로 끝내지 않는지 설명해 준다

강의 3장과 4장은 데이터를 코드 밖으로 빼고, 그 공급 구조를 중앙화한다.
이 지점은 아래 두 문서와 거의 그대로 맞물린다.

- `Data Driven Gameplay Elements`
- `Asset Management`

핵심은 아래 두 층을 분리하는 것이다.

- 데이터 원본: `FMonsterInfo`, `DT_MonsterInfo`, `PDA_MonsterInfo`
- 데이터 공급 구조: `AssetManager`, `PrimaryDataAsset`, `GameInstanceSubsystem`

즉 `260414`의 목표는 "테이블을 하나 만든다"가 아니라, `데이터가 언제 어디서 실제 몬스터 상태로 들어오는가`를 엔진 친화적인 구조로 정리하는 데 있다.

## 4. 추천 읽기 순서

이번 날짜는 아래 순서로 읽으면 가장 자연스럽다.

1. [Behavior Tree in Unreal Engine - User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide?application_version=5.6)
2. [AI Perception in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-perception-in-unreal-engine)
3. [Basic Navigation in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/basic-navigation-in-unreal-engine)
4. [Data Driven Gameplay Elements in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/data-driven-gameplay-elements-in-unreal-engine)
5. [Asset Management in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/asset-management-in-unreal-engine)

이 순서가 좋은 이유는 먼저 `감지와 판단`을 AI 문서로 잡고, 그다음 `그 판단이 읽을 데이터`를 어떻게 공급하는지로 내려가기 쉽기 때문이다.

## 정리

공식 문서 기준으로 다시 보면 `260414`는 아래 다섯 가지를 배우는 날이다.

1. 몬스터 AI는 `Perception -> Blackboard -> Behavior Tree` 구조 위에 선다.
2. `NavMesh`는 행동 이전의 이동 전제다.
3. `MonsterState`와 `FMonsterInfo`는 런타임 상태와 데이터 원본을 분리하는 구조다.
4. `PrimaryDataAsset`, `AssetManager`, `GameInstanceSubsystem`은 데이터를 중앙에서 공급하는 구조다.
5. 그래서 `260414`의 성과는 몬스터 행동 하나를 만드는 것이 아니라, 이후 모든 AI 강의가 올라갈 표준 기반을 세우는 데 있다.

[260414 허브](../) | [이전: 04 AssetManager와 데이터 로딩](../04_intermediate_assetmanager_and_data_loading/) | [다음: 06 현재 프로젝트 C++ 부록](../06_appendix_current_project_cpp_reference/)
