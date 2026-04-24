---
title: 260408 02 Animation Notify와 커스텀 UAnimNotify
---

# 260408 02 Animation Notify와 커스텀 UAnimNotify

[이전: 01 몽타주와 슬롯](../01_beginner_animmontage_and_slot_structure/) | [260408 허브](../) | [다음: 03 콤보와 템플릿](../03_intermediate_combo_sections_and_animation_template/)

## 문서 개요

몽타주가 공격의 시간축을 만들었다면, `Notify`는 그 시간축 안에서 "정확히 어느 프레임에 무엇을 할지"를 정한다.
이 편은 콤보 입력 창구, 실제 타격 판정, 스킬 캐스팅처럼 프레임 정확도가 필요한 기능이 어떻게 애니메이션과 연결되는지 정리한다.

## 1. Notify는 애니메이션 안의 시간표다

입력 허용, 이펙트 재생, 사운드, 실제 판정은 모두 같은 시점에 일어나면 안 된다.
그래서 언리얼은 애니메이션 타임라인 위에 이벤트를 박아 넣는 `Notify` 시스템을 제공한다.

![노티파이 타임라인과 섹션 구성](../assets/images/notify-timeline.jpg)

## 2. 일반 Notify와 Notify State는 역할이 다르다

- 일반 `Notify`: 특정 프레임에서 한 번 실행
- `Notify State`: 시작과 끝이 있는 구간형 이벤트

현재 저장소에서 직접 눈에 띄는 구조는 일반 Notify와 커스텀 `UAnimNotify` 쪽에 더 가깝다.
즉 `260408`은 노티파이 전체 개념을 소개하면서도, 실제 프로젝트에서는 `ComboStart`, `ComboEnd`, `AnimNotify_SkillCasting`, `AnimNotify_PlayerAttack` 같은 "시점 이벤트"가 핵심이 된다.

## 3. 함수형 노티파이는 이름 규칙으로 연결된다

애님 에디터에서 `ComboStart`, `ComboEnd`를 찍어 두면, `UPlayerAnimInstance`는 `AnimNotify_ComboStart()`, `AnimNotify_ComboEnd()`로 이를 직접 받을 수 있다.

```cpp
void UPlayerAnimInstance::AnimNotify_ComboStart()
{
    mComboEnable = true;
}

void UPlayerAnimInstance::AnimNotify_ComboEnd()
{
    mComboEnable = false;
}
```

이 방식의 장점은 분명하다.
콤보 입력 가능 시간을 코드 타이머가 아니라 애니메이션 타임라인에서 조절할 수 있다.

## 4. 커스텀 `UAnimNotify`는 기능 자체를 노티파이로 만든다

단순 이름 신호보다 더 기능적인 트리거가 필요하면 `UAnimNotify`를 상속한 클래스를 만든다.
현재 프로젝트의 대표 예시는 `UAnimNotify_PlayerAttack`이다.

![커스텀 노티파이 헤더](../assets/images/notify-custom-header.jpg)

![커스텀 노티파이 클래스 작성](../assets/images/notify-custom-class.jpg)

강의 구조상 이 클래스는 "정확히 이 프레임에 실제 공격을 실행하라"는 공통 트리거가 된다.
그래서 캐릭터마다 `NormalAttack()` 내용은 달라도, 타격 시점은 같은 노티파이 규칙 아래서 유지된다.

## 5. 현재 branch에 맞춰 다시 읽기

강의 당시 설명은 `APlayerCharacter` 중심으로 보지만, 지금 branch의 `UAnimNotify_PlayerAttack::Notify()`는 `MeshComp->GetOwner<APlayerCharacterGAS>()`를 사용한다.
`UPlayerTemplateAnimInstance::AnimNotify_SkillCasting()`도 `TryGetPawnOwner()`를 `APlayerCharacterGAS`로 받아 `Skill1Casting()`을 호출한다.

즉 최신 구현에서는 노티파이 구조 자체는 유지되되, 노티파이가 돌아가는 소유자 계층이 GAS 플레이어 라인으로 옮겨 갔다고 보면 된다.

![강의에서 `UAnimNotify` 시그니처를 짚는 장면](../assets/images/notify-interface-signature-live.jpg)

## 정리

이 편의 핵심은 `입력 시점`과 `실제 실행 시점`을 분리하는 데 있다.
몽타주가 시간축을 열고, 노티파이가 그 안에서 콤보 창구와 판정 프레임을 정확히 찍어 준다.

[이전: 01 몽타주와 슬롯](../01_beginner_animmontage_and_slot_structure/) | [260408 허브](../) | [다음: 03 콤보와 템플릿](../03_intermediate_combo_sections_and_animation_template/)
