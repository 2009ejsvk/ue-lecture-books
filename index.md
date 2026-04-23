---
title: UE Lecture Books
---

# 언리얼 강의 교재 아카이브

이 저장소는 언리얼 엔진 학습 내용을 날짜별 Markdown 교재로 정리한 아카이브입니다.
이제 페이지는 더 이상 대시보드형 HTML이나 슬라이드형 교안이 아니라, GitHub Pages에서 바로 읽을 수 있는 문서형 노트로 구성됩니다.

## 교재 목록

- [260401. 언리얼 프로젝트를 처음 만들고 에디터 화면, 클래스 구조, 블루프린트 기초를 익히는 입문](./260401/)
- [260402. 플레이어를 움직이고 카메라를 붙이고 공격 입력으로 총알을 생성하는 블루프린트 기초](./260402/)
- [260403. 충돌 판정, 태그, 타이머, 트리거 박스로 상호작용과 함정을 만드는 기초](./260403/)
- [260406. 플레이어를 C++ 클래스로 옮기고 GameMode와 입력 자산을 연결하는 기초](./260406/)
- [260407. 이동 속도와 시선 값을 애니메이션으로 연결해 자연스러운 플레이어 움직임을 만드는 기초](./260407/)
- [260408. 공격 몽타주, 슬롯, 노티파이, 콤보 섹션으로 전투 애니메이션을 조립하는 구조](./260408/)
- [260409. 공격 판정, 데미지, 이펙트, 사운드, 투사체를 묶어 플레이어 전투를 완성하는 기초](./260409/)
- [260410. Wraith 투사체, 데칼, Shinbi 스킬 캐스팅 모션으로 공격 표현을 확장하는 날](./260410/)
- [260413. Mouse Picking, 마법진 지정형 스킬, Geometry Collection으로 위치 기반 파괴 연출을 만드는 날](./260413/)
- [260414. 몬스터 본체, 감지, 비헤이비어 트리, 블랙보드, 데이터 관리까지 AI 기반을 세우는 날](./260414/)
- [260415. 몬스터를 스폰하고 순찰시키고 플레이어를 감지하면 추적으로 바꾸는 AI 기초](./260415/)
- [260416. 추적에서 공격으로 넘어가고 노티파이 시점에 타격하는 몬스터 전투 AI 루프](./260416/)
- [260417. 비전투 대기와 순찰을 반복하는 AI를 만들고 순찰 버그를 디버깅하는 날](./260417/)
- [260420. 몬스터가 죽은 뒤 랙돌로 쓰러지고 아이템 박스를 떨어뜨린 뒤 획득까지 이어지는 마무리](./260420/)
- [260421. GASDocumentation 예제와 Epic 공식 문서를 함께 읽으며 Gameplay Ability System을 초급, 중급, 고급으로 나눠 배우는 분권형 교재](./260421/)
- [260422. UE20252 실전 프로젝트에 GameplayEffect와 ManaCost 파이프라인을 실제로 붙이며 GAS를 체감하는 보충 교재](./260422/)

## 읽는 방식

- 각 교재는 `강의 흐름 -> 장별 해설 -> 코드 발췌 -> 도판 -> 복습` 순서로 정리되어 있습니다.
- 설명은 `D:\UE_Academy_Stduy_compressed`의 강의 영상, 자막, 캡처와 `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 소스를 함께 대조해 작성했습니다.
- 이후 날짜가 추가되면 같은 형식으로 Markdown 교재를 계속 늘려 갈 수 있습니다.

## 현재 포함된 주제

- `260401`: 새 프로젝트를 만들고 템플릿을 고른 뒤, 언리얼 에디터 각 패널을 읽는 법과 `UObject -> Actor -> Component -> Pawn -> Character` 관계, 블루프린트 이벤트와 변수 기초를 익히는 문서
- `260402`: `Skeletal Mesh`, `Movement Component`, `Spring Arm`, `Camera`를 붙여 플레이어를 움직이고, `IA_Move`, `IA_Attack`, `BPBullet`, `Spawn Actor`로 공격 입력과 발사체 생성을 연결하는 문서
- `260403`: `Block / Overlap / Ignore` 충돌 규칙, `Projectile Stop`, `Actor Tag`, `Timer`, `Trigger Box`, `Level Blueprint`를 이용해 맞았을 때 반응하고, 구분하고, 함정을 작동시키는 기초 문서
- `260406`: `PlayerCharacter`, `Shinbi`, `DefaultGameMode`, `InputData`, `MappingContext`를 중심으로 플레이어를 블루프린트에서 C++ 구조로 옮기고 `Rotation`, `Jump`, `Attack` 입력을 연결하는 문서
- `260407`: `AnimInstance`, `Animation Blueprint`, `Aim Offset`, `GroundLocomotion`, `Blend Space`, 점프 상태 머신을 이용해 플레이어의 이동 속도와 시선 값을 자연스러운 애니메이션으로 바꾸는 문서
- `260408`: `AnimMontage`, `Slot`, `Notify`, `Combo Section`, `PlayerAnimInstance`, `Animation Template`를 이용해 공격 모션, 콤보 입력 타이밍, 전투 애니메이션 재생 구조를 만드는 문서
- `260409`: `PlayerTemplateAnimInstance`, 충돌 채널과 프로파일, `Sweep`, `TakeDamage`, 파티클, 사운드, 투사체를 묶어 실제 공격 판정과 피격 반응이 있는 플레이어 전투 파이프라인을 만드는 문서
- `260410`: `Wraith`, `Muzzle_01`, `ProjectileMovement`, `WraithBullet`, `Decal`, `Layered Blend Per Bone`, `Skill1 Montage`를 이용해 총알 자국과 스킬 캐스팅 모션까지 포함한 공격 표현 구조를 확장하는 문서
- `260413`: `MainPlayerController`, `GetHitResultUnderCursor`, `ADecalBase`, `Shinbi::Skill1Casting`, `Geometry Collection`, `ApplyExternalStrain`, `GeometryActor`를 이용해 마우스 지정형 스킬과 파괴 연출을 연결하는 문서
- `260414`: `MonsterBase`, `AIController`, `AIPerception`, `Behavior Tree`, `Blackboard`, `MonsterState`, `DataTable`, `AssetManager`를 이용해 몬스터 AI의 본체, 감지, 판단, 데이터 관리 기반을 세우는 문서
- `260415`: `SpawnPoint`, `PatrolPath`, `Behavior Tree` 등록, `Perception`, `Move To`를 이용해 몬스터가 월드에 생성되고 순찰하다가 플레이어를 보면 추적하도록 만드는 문서
- `260416`: `MonsterAnimInstance`, `MonsterTrace Task`, `MonsterAttack Task`, `AnimNotify` 기반 전투 루프를 이용해 추적에서 공격으로 넘어가고 타격 시점을 맞추는 몬스터 전투 문서
- `260417`: `Monster Wait Task`, `Monster Patrol Task`, 엔진/에디터 버그 수정 사례를 통해 몬스터가 비전투 상태에서 대기하고 순찰하는 루프를 만들고, 순찰이 꼬일 때 어떻게 디버깅하는지 다루는 문서
- `260420`: `Monster Death`, `AnimNotify_Death`, `Ragdoll`, `Physics Asset`, `ItemBox`, `Drop Animation`, `Overlap Pickup`을 묶어 몬스터 사망 이후 쓰러짐, 드롭, 획득까지 마무리하는 문서
- `260421`: `GASDocumentation` 예제 프로젝트를 기준으로 `ASC`, `AttributeSet`, `GameplayAbility`, `GameplayEffect`, `GameplayTag`를 처음부터 다시 정리하고, 이를 `초급`, `중급`, `고급`, `부록`으로 나눠 `GDGA_CharacterJump`, `GDGA_FireGun`, `GDAttributeSetBase`, `GDDamageExecCalculation`, `GDPlayerState`까지 단계적으로 읽는 문서. Epic 공식 문서 연결과 별도 공식 문서 참고 가이드도 포함한다.
- `260422`: `UE20252` 실제 프로젝트 코드로 돌아와 `ShinbiGAS`, `GameplayAbility_Attack`, `GameplayAbility_Base`, `GameplayEffect_ManaCost`, `BaseAttributeSet`을 중심으로 `GameplayEvent -> ManaCost GameplayEffect -> SetByCaller -> ApplyGameplayEffectSpecToSelf -> PostGameplayEffectExecute` 흐름을 체감하는 보충 문서

## 저장소 구조

- `index.md`: 루트 서가
- `260401/index.md`: 2026-04-01 강의 교재
- `260402/index.md`: 2026-04-02 강의 교재
- `260403/index.md`: 2026-04-03 강의 교재
- `260406/index.md`: 2026-04-06 강의 교재
- `260407/index.md`: 2026-04-07 강의 교재
- `260408/index.md`: 2026-04-08 강의 교재
- `260409/index.md`: 2026-04-09 강의 교재
- `260410/index.md`: 2026-04-10 강의 교재
- `260413/index.md`: 2026-04-13 강의 교재
- `260414/index.md`: 2026-04-14 강의 교재
- `260415/index.md`: 2026-04-15 강의 교재
- `260416/index.md`: 2026-04-16 강의 교재
- `260417/index.md`: 2026-04-17 강의 교재
- `260420/index.md`: 2026-04-20 강의 교재
- `260421/index.md`: 2026-04-21 GASDocumentation 기반 GAS 입문 교재
- `260422/index.md`: 2026-04-22 UE20252 실전 GameplayEffect 보충 교재
- `260421/assets/images`: GAS 입문 교재용 이미지 자리
- `260422/assets/images`: UE20252 실전 GameplayEffect 교재용 이미지 자리
- `260401/assets/images`, `260402/assets/images`, `260403/assets/images`, `260406/assets/images`, `260407/assets/images`, `260408/assets/images`, `260409/assets/images`, `260410/assets/images`, `260413/assets/images`, `260414/assets/images`, `260415/assets/images`, `260416/assets/images`, `260417/assets/images`, `260420/assets/images`: 원본 영상에서 다시 추출한 캡처
