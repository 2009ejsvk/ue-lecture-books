---
title: UE Lecture Books
---

# 언리얼 강의 교재 아카이브

이 저장소는 언리얼 엔진 학습 내용을 날짜별 Markdown 교재로 정리한 아카이브입니다.
이제 페이지는 더 이상 대시보드형 HTML이나 슬라이드형 교안이 아니라, GitHub Pages에서 바로 읽을 수 있는 문서형 노트로 구성됩니다.

## 교재 목록

- [260401. 언리얼 프로젝트와 블루프린트 입문](./260401/)
- [260402. 플레이어 블루프린트와 발사체 기초](./260402/)
- [260403. 충돌, 태그, 트리거 기반 기믹 입문](./260403/)
- [260406. 플레이어 C++ 전환과 입력 시스템 기초](./260406/)
- [260407. 플레이어 로코모션 애니메이션 기초](./260407/)
- [260408. 플레이어 공격 애니메이션 구조](./260408/)
- [260409. 플레이어 전투 파이프라인 기초](./260409/)
- [260414. 몬스터 AI 기반 구축](./260414/)
- [260415. 몬스터 스폰과 순찰 AI 기초](./260415/)
- [260416. 몬스터 전투 AI 루프](./260416/)
- [260417. 몬스터 비전투 루프와 순찰 디버깅](./260417/)
- [260420. 몬스터 사망, 랙돌, 아이템 박스 드롭](./260420/)

## 읽는 방식

- 각 교재는 `강의 흐름 -> 장별 해설 -> 코드 발췌 -> 도판 -> 복습` 순서로 정리되어 있습니다.
- 설명은 `D:\UE_Academy_Stduy_compressed`의 강의 영상, 자막, 캡처와 `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 소스를 함께 대조해 작성했습니다.
- 이후 날짜가 추가되면 같은 형식으로 Markdown 교재를 계속 늘려 갈 수 있습니다.

## 현재 포함된 주제

- `260401`: 프로젝트 생성, 템플릿, 언리얼 에디터, UObject, Actor, Component, Pawn, Character, Blueprint 기초
- `260402`: Skeletal Mesh, Movement Component, Spring Arm, Camera, IA_Move, IA_Attack, BPBullet, Spawn Actor
- `260403`: Block/Overlap/Ignore, Projectile Stop, Actor Tag, Timer, Trigger Box, Level Blueprint
- `260406`: PlayerCharacter, Shinbi, DefaultGameMode, InputData, MappingContext, Rotation, Jump, Attack
- `260407`: AnimInstance, Animation Blueprint, Aim Offset, GroundLocomotion, Blend Space, Jump 상태 머신
- `260408`: AnimMontage, Slot, Notify, Combo Section, PlayerAnimInstance, Animation Template
- `260409`: PlayerTemplateAnimInstance, 충돌 채널/프로파일, Sweep, TakeDamage, 파티클, 사운드, 투사체
- `260414`: MonsterBase, AIController, AIPerception, Behavior Tree, Blackboard, MonsterState, DataTable, AssetManager
- `260415`: SpawnPoint, PatrolPath, Behavior Tree 등록, Perception, Move To
- `260416`: MonsterAnimInstance, MonsterTrace Task, MonsterAttack Task, AnimNotify 기반 전투 루프
- `260417`: Monster Wait Task, Monster Patrol Task, 엔진/에디터 버그 수정
- `260420`: Monster Death, AnimNotify_Death, Ragdoll, Physics Asset, ItemBox, Drop Animation, Overlap Pickup

## 저장소 구조

- `index.md`: 루트 서가
- `260401/index.md`: 2026-04-01 강의 교재
- `260402/index.md`: 2026-04-02 강의 교재
- `260403/index.md`: 2026-04-03 강의 교재
- `260406/index.md`: 2026-04-06 강의 교재
- `260407/index.md`: 2026-04-07 강의 교재
- `260408/index.md`: 2026-04-08 강의 교재
- `260409/index.md`: 2026-04-09 강의 교재
- `260414/index.md`: 2026-04-14 강의 교재
- `260415/index.md`: 2026-04-15 강의 교재
- `260416/index.md`: 2026-04-16 강의 교재
- `260417/index.md`: 2026-04-17 강의 교재
- `260420/index.md`: 2026-04-20 강의 교재
- `260401/assets/images`, `260402/assets/images`, `260403/assets/images`, `260406/assets/images`, `260407/assets/images`, `260408/assets/images`, `260409/assets/images`, `260414/assets/images`, `260415/assets/images`, `260416/assets/images`, `260417/assets/images`, `260420/assets/images`: 원본 영상에서 다시 추출한 캡처
