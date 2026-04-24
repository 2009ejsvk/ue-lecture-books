---
title: 260402 플레이어 이동, 숄더뷰 카메라, 공격 입력 허브
---

# 260402 플레이어 이동, 숄더뷰 카메라, 공격 입력 허브

[루트](../) | [이전 날짜: 260401](../260401/) | [다음 날짜: 260403](../260403/)

## 문서 개요

`260402`는 처음으로 "조작 가능한 플레이어"를 손으로 조립하는 날이다.
이번 날짜에서는 `Movement Component`, `Skeletal Mesh`, `Spring Arm`, `Camera`, `Enhanced Input`, `Spawn Actor`를 한 줄로 묶어서, 플레이어가 움직이고 바라보고 쏘는 가장 기초적인 액션 게임 루프를 만든다.

기존에는 한 파일로 정리되어 있었지만, 이번에는 강의 흐름에 맞춰 아래 다섯 편으로 분권했다.

![플레이어 테스트 씬과 기본 이동 실험](./assets/images/bpplayer-test-scene.jpg)

## 추천 읽기 순서

1. [초급 1편. 이동 컴포넌트와 메시 기초](./01_beginner_movement_components_and_meshes/)
2. [초급 2편. BPPlayer와 숄더뷰 카메라](./02_beginner_bpplayer_and_shoulder_camera/)
3. [초급 3편. 공격 입력과 총알 스폰](./03_beginner_attack_bullet_and_spawn_actor/)
4. [부록 1. 공식 문서로 다시 읽는 플레이어와 스폰](./04_appendix_official_docs_reference/)
5. [부록 2. 현재 프로젝트 C++로 다시 읽는 플레이어와 발사체](./05_appendix_current_project_cpp_reference/)

## 빠른 선택 가이드

- `Static Mesh`, `Skeletal Mesh`, `Floating Pawn Movement`, `Projectile Movement`를 먼저 구분하고 싶으면 [초급 1편](./01_beginner_movement_components_and_meshes/)부터 읽으면 된다.
- `BPPlayer`, `Spring Arm`, `Camera`, `Enhanced Input` 구조를 바로 잡고 싶으면 [초급 2편](./02_beginner_bpplayer_and_shoulder_camera/)이 가장 직접적이다.
- `IA_Attack`, `BPBullet`, `Spawn Actor from Class`, `Forward Vector` 흐름이 궁금하면 [초급 3편](./03_beginner_attack_bullet_and_spawn_actor/)으로 가면 된다.
- 공식 문서 기준 용어와 추천 읽기 순서를 같이 보고 싶으면 [부록 1](./04_appendix_official_docs_reference/), 현재 `UE20252` 소스 구조와 연결해서 읽고 싶으면 [부록 2](./05_appendix_current_project_cpp_reference/)를 보면 된다.

## 이번 날짜의 핵심 목표

- 플레이어는 메시 하나가 아니라 `Character`와 컴포넌트 조합으로 만들어진다는 점을 이해한다.
- `Spring Arm + Camera` 조합이 왜 3인칭/숄더뷰 시점의 기본 패턴인지 설명할 수 있다.
- `IA_Move`, `IA_Rotation`, `IA_Attack`와 `Mapping Context`가 입력 의미를 어떻게 정리하는지 말할 수 있다.
- 발사체는 메시를 직접 움직이는 것이 아니라 별도 액터를 `Spawn Actor`로 생성해 다룬다는 점을 정리할 수 있다.
- 현재 프로젝트 C++가 블루프린트 실습 결과를 어떻게 `APlayerCharacter`, `UDefaultInputData`, `ATestBullet`, `AProjectileBase`, `AWraithBullet`로 굳혔는지 연결해서 읽을 수 있다.

## 사용한 자료

- `D:\UE_Academy_Stduy_compressed\260402_1_이동 컴포넌트.mp4`
- `D:\UE_Academy_Stduy_compressed\260402_2_플레이어 제작.mp4`
- `D:\UE_Academy_Stduy_compressed\260402_3_액터 스폰과 회전.mp4`
- `D:\UE_Academy_Stduy_compressed\260402_3_액터 스폰과 회전_2.mp4`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 이번 분권에서 보강한 포인트

- 기존 통합 문서를 `이동/카메라/공격` 흐름 기준으로 끊어서 읽기 부담을 줄였다.
- 기존 이미지 10장을 각 편의 맥락에 맞게 재배치했다.
- `Spring Arm`, `Add Mapping Context`, `Spawn Actor from Class`, `Floating Pawn Movement` 세팅 화면을 새 스크린샷으로 추가했다.
- 부록에서는 현재 `UE20252`의 입력 자산, 카메라 세팅, 발사체 C++ 구조까지 바로 이어지게 설명을 정리했다.

![Spawn Actor from Class를 추가하는 장면](./assets/images/spawn-actor-from-class-node.png)

## 읽기 메모

이번 날짜는 뒤의 전투, 충돌, 데미지 시스템보다 훨씬 앞단에 있다.
하지만 여기서 익히는 `컴포넌트`, `입력 자산`, `액터 스폰` 감각이 있어야 이후 `260403`, `260409`, `260421`, `260422`, `260423`의 전투 파이프라인도 자연스럽게 읽힌다.
