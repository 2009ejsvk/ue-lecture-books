---
title: 260417 비전투 대기와 순찰을 반복하는 AI를 만들고 순찰 버그를 디버깅하는 날
---

# 260417 비전투 대기와 순찰을 반복하는 AI를 만들고 순찰 버그를 디버깅하는 날

[← 260416](../260416/) | [루트 허브](../index.md) | [260420 →](../260420/)

## 문서 개요

`260417`의 핵심은 전투 기능을 더 붙이는 데 있지 않고, `비전투 상태의 몬스터가 필드에서 자연스럽게 시간을 보내는 루프`를 안정적으로 만드는 데 있다.

이번 날짜의 전체 흐름은 아래 한 줄로 요약할 수 있다.

`MonsterWait -> MonsterPatrol -> Debugging -> Repeat`

즉 이 날은 `가만히 서 있기`, `점 기반 순찰`, `왜 갑자기 멈추거나 이상하게 끝나는가`를 한 세트로 다룬다.

## 학습 순서

1. [01 Monster Wait Task와 비전투 대기](./01_intermediate_monster_wait_task_and_noncombat_state/)
2. [02 Monster Patrol Task와 점 기반 루프](./02_intermediate_monster_patrol_task_and_point_loop/)
3. [03 비전투 루프 디버깅](./03_intermediate_noncombat_loop_debugging/)
4. [04 공식 문서 부록](./04_appendix_official_docs_reference/)
5. [05 현재 프로젝트 C++ 부록](./05_appendix_current_project_cpp_reference/)

## 이번 분권에서 보강한 내용

- 기존 통합 문서를 `Wait`, `Patrol`, `디버깅`, `공식 문서`, `현재 프로젝트 C++` 다섯 편으로 분리했다.
- 기존 이미지 9장을 각 편의 설명 흐름에 맞게 재배치했다.
- 강의 캡처에서 `MonsterWait 코드`, `순찰 런타임 클로즈업`, `거리 종료 조건 코드` 컷 3장을 새로 추가했다.
- 현재 branch 기준으로 `MonsterSpawnPoint -> AMonsterGAS -> BTTask_PatrolGAS` 대응 관계와, 대기 설명은 여전히 legacy `BTTask_MonsterWait` 쪽이 가장 직접적이라는 점을 함께 보강했다.

## 현재 branch 추적 메모

`260417`의 비전투 루프는 지금도 중요한 설명 축이다.

- 스폰/순찰 입력: `AMonsterSpawnPoint`
- 공통 순찰 데이터 보관: `AMonsterBase` 또는 `AMonsterGAS`
- 대기 태스크 설명 기준: `UBTTask_MonsterWait`
- 현재 branch 순찰 대응물: `UBTTask_PatrolGAS`

즉 현재 저장소에서도 `WaitTime`, `Target`, `PatrolPoints`, `mPatrolIndex` 같은 개념은 그대로 유효하고, 대상 본체와 일부 태스크만 GAS 쪽으로 옮겨 간 상태다.

## 핵심 문장

`260417`의 본질은 서 있는 몬스터를 만드는 데 있지 않고, `대기 -> 순찰 -> 다시 대기`가 반복되면서도 언제든 전투 브랜치로 끊어질 수 있는 비전투 상태기계를 만드는 데 있다.

## 자료

- 원본 영상: `D:\UE_Academy_Stduy_compressed\260417_1~3`
- 실제 코드: `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- 덤프 자료: `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 다음 단계

다음 날짜 [260420](../260420/)부터는 지금까지 만든 전투/비전투 루프의 끝점인 `사망`, `드롭`, `후반 정리` 쪽으로 축이 넘어간다.

[← 260416](../260416/) | [루트 허브](../index.md) | [260420 →](../260420/)
