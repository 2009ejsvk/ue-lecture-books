---
title: 260403 충돌 판정, 태그, 타이머, 트리거 허브
---

# 260403 충돌 판정, 태그, 타이머, 트리거 허브

[루트](../) | [이전 날짜: 260402](../260402/)

## 문서 개요

`260403`은 플레이어와 발사체를 단순히 보이게 만드는 단계에서 한 걸음 더 나아가, "누가 누구와 부딪히고 어떤 규칙으로 반응하는가"를 배우는 날이다.
이번 날짜에서는 `Projectile Stop`, `Hit`, `Overlap`, `Actor Tag`, `Set Timer by Event`, `Trigger Box`를 묶어서 충돌 기반 게임 규칙의 기초를 만든다.

기존에는 한 파일로 정리되어 있었지만, 이번에는 강의 흐름에 맞춰 아래 다섯 편으로 분권했다.

![충돌 개념을 설명하는 기본 스테이지](./assets/images/collision-channel-concept.jpg)

## 추천 읽기 순서

1. [초급 1편. 충돌 시스템과 Projectile Stop](./01_beginner_collision_projectile_hit_overlap/)
2. [중급 1편. 몬스터 타이머와 액터 태그](./02_intermediate_monster_timer_and_actor_tags/)
3. [중급 2편. Trigger Box와 Level Blueprint 함정](./03_intermediate_trigger_box_and_level_blueprint_traps/)
4. [부록 1. 공식 문서로 다시 읽는 충돌과 트리거](./04_appendix_official_docs_reference/)
5. [부록 2. 현재 프로젝트 C++로 다시 읽는 판정 구조](./05_appendix_current_project_cpp_reference/)

## 빠른 선택 가이드

- `Block`, `Overlap`, `Ignore`, `Projectile Stop`, `Hit Result` 흐름을 먼저 잡고 싶으면 [초급 1편](./01_beginner_collision_projectile_hit_overlap/)부터 읽으면 된다.
- `Set Timer by Event`, `Fire`, `PlayerBullet`, `MonsterBullet`, `Actor Has Tag` 구조가 궁금하면 [중급 1편](./02_intermediate_monster_timer_and_actor_tags/)이 가장 직접적이다.
- `Trigger Box`, `Begin/End Overlap`, `Level Blueprint`, 함정 큐브 스폰을 보고 싶으면 [중급 2편](./03_intermediate_trigger_box_and_level_blueprint_traps/)으로 가면 된다.
- 공식 문서 기준 용어를 같이 잡고 싶으면 [부록 1](./04_appendix_official_docs_reference/), 현재 `UE20252` 코드 구조까지 연결해서 읽고 싶으면 [부록 2](./05_appendix_current_project_cpp_reference/)를 보면 된다.

## 이번 날짜의 핵심 목표

- `Block`, `Overlap`, `Ignore`를 물리 반응이 아니라 규칙표로 이해한다.
- `Projectile Stop`, `Hit`, `Overlap`이 각각 어떤 상황에서 쓰이는지 구분할 수 있다.
- 태그가 충돌 이후 판정 분기를 위한 가장 가벼운 식별자라는 점을 이해한다.
- `Set Timer by Event`가 반복 행동의 리듬 장치라는 점을 설명할 수 있다.
- `Trigger Box`와 `Level Blueprint`가 전투 외 맵 기믹의 시작점이라는 점을 정리할 수 있다.
- 현재 프로젝트 C++에서 이 구조가 `AProjectileBase`, `AWraithBullet`, `AGeometryActor`, `AItemBox`, `AMonsterBase`, `AMonsterSpawnPoint`로 어떻게 이어지는지 읽을 수 있다.

## 사용한 자료

- `D:\UE_Academy_Stduy_compressed\260403_1_기본 충돌 시스템.mp4`
- `D:\UE_Academy_Stduy_compressed\260403_2_기본 몬스터 제작 및 액터 태그.mp4`
- `D:\UE_Academy_Stduy_compressed\260403_3_트리거 박스를 이용한 함정 제작.mp4`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 이번 분권에서 보강한 포인트

- 기존 통합 문서를 `충돌 -> 타이머/태그 -> 트리거 함정` 흐름으로 나눠 읽기 부담을 줄였다.
- 기존 이미지 10장을 각 편의 맥락에 맞게 재배치했다.
- `Hit/Overlap 이벤트 패널`, `Set Timer by Event`, `Actor Has Tag(MonsterBullet)`, `Trigger Box 배치`, `SpawnActor BPTestCube` 화면을 새 스크린샷으로 추가했다.
- 부록에서는 현재 branch 기준 `충돌 프로파일`, `팀 ID`, `TakeDamage`, `SetTimer` API까지 이어지도록 설명을 정리했다.

![트리거 박스를 월드에 배치하는 장면](./assets/images/trigger-box-placement.png)

## 읽기 메모

이번 날짜는 아직 화려한 데미지 연출을 만드는 날이 아니다.
대신 이후의 투사체, 몬스터, 함정, AI 판정이 공통으로 기대는 `이벤트 시작점`과 `반응 규칙`을 배우는 날이라고 보는 편이 더 정확하다.
