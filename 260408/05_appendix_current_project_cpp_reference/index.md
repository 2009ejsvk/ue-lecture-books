---
title: 260408 05 현재 프로젝트 C++로 다시 읽는 공격 몽타주와 노티파이 구조
---

# 260408 05 현재 프로젝트 C++로 다시 읽는 공격 몽타주와 노티파이 구조

[이전: 04 공식 문서](../04_appendix_official_docs_reference/) | [260408 허브](../) | [다음 날짜: 260409](../260409/)

## 문서 개요

현재 프로젝트 C++ 기준으로 `260408`을 다시 읽으면, 핵심은 `입력과 실제 타격 실행이 분리되어 있다`는 점이다.
공격 버튼은 우선 몽타주를 열고, 실제 판정은 노티파이가 찍힌 프레임에 다시 게임플레이 코드로 돌아온다.

## 1. 입력은 먼저 애니메이션 시작 신호만 보낸다

`APlayerCharacter::AttackKey()`는 곧바로 데미지를 주지 않는다.
먼저 `InputAttack()`으로 넘기고, 각 캐릭터가 거기서 `PlayAttack()` 또는 `PlaySkill1()`을 고른다.

```cpp
void APlayerCharacter::AttackKey(const FInputActionValue& Value)
{
    InputAttack();
}

void AShinbi::InputAttack()
{
    if (IsValid(mMagicCircleActor))
    {
        mAnimInst->PlaySkill1();
        mAnimInst->ClearSkill1();
    }
    else
    {
        mAnimInst->PlayAttack();
    }
}

void AWraith::InputAttack()
{
    mAnimInst->PlayAttack();
}
```

즉 입력은 "당장 때리기"보다 "전투용 애니메이션 시간축 열기"에 더 가깝다.

## 2. `UPlayerAnimInstance`가 전투 상태를 들고 있다

현재 프로젝트의 공격 구조는 `UPlayerAnimInstance`에 모여 있다.

- `mAttackMontage`
- `mAttackSection`
- `mAttackIndex`
- `mComboEnable`
- `mAttackEnable`
- `mSkill1Montage`
- `mSkill1Section`
- `mSkill1Index`

이 필드들이 있어야 첫 타 시작, 콤보 연장, 스킬 몽타주 재생을 하나의 규칙 안에서 다룰 수 있다.

## 3. `PlayAttack()`은 첫 타 시작과 콤보 연장을 구분한다

현재 코드의 핵심 분기는 아래 한 줄로 요약된다.

- `mAttackEnable == true`면 첫 타 시작
- `mComboEnable == true`면 다음 섹션 연장

강의 화면도 이 분기를 꽤 직접적으로 보여 준다.

![강의에서 `PlayAttack()`의 콤보 연장 분기를 설명하는 장면](../assets/images/combo-playattack-branch-live.jpg)

즉 콤보는 연타 횟수가 아니라 `노티파이가 연 짧은 창구에서 다음 섹션으로 이어 붙이는 규칙`이다.

## 4. 노티파이가 다시 게임플레이 코드로 돌아온다

`AnimNotify_ComboStart()`와 `AnimNotify_ComboEnd()`는 콤보 입력 창구를 여닫고, `OnMontageEnded`는 몽타주 종료 시 상태를 초기화한다.
그리고 실제 타격은 커스텀 노티파이 `UAnimNotify_PlayerAttack`가 담당한다.

지금 branch에서는 이 노티파이가 `APlayerCharacter`가 아니라 `APlayerCharacterGAS`를 기준으로 주인을 얻는다.

```cpp
void UAnimNotify_PlayerAttack::Notify(USkeletalMeshComponent* MeshComp,
    UAnimSequenceBase* Animation, const FAnimNotifyEventReference& EventReference)
{
    Super::Notify(MeshComp, Animation, EventReference);

    TObjectPtr<APlayerCharacterGAS> PlayerChar =
        MeshComp->GetOwner<APlayerCharacterGAS>();

    if (IsValid(PlayerChar))
    {
        PlayerChar->NormalAttack();
    }
}
```

즉 최신 구현에서는 노티파이 구조는 그대로 두고, 호출 대상만 GAS 플레이어 라인으로 옮긴 셈이다.

## 5. 스킬 캐스팅도 같은 구조를 쓴다

`UPlayerTemplateAnimInstance::AnimNotify_SkillCasting()` 역시 현재 branch에서 `APlayerCharacterGAS`를 기준으로 `Skill1Casting()`을 호출한다.
그래서 스킬도 `입력 -> 몽타주 -> 노티파이 -> 실제 로직` 흐름 안에서 움직인다.

## 6. 템플릿 레이어가 공용 규약을 묶는다

`UPlayerTemplateAnimInstance`는 `mAnimMap`, `mBlendSpaceMap`으로 캐릭터별 자산을 들고, 부모 그래프 `ABPPlayerTemplate`는 공통 슬롯과 공통 전이 규칙을 유지한다.
즉 공용 전투 규칙은 부모에 두고, 캐릭터별 차이는 자산 매핑으로만 남긴다.

![강의에서 템플릿 필드를 설명하는 장면](../assets/images/template-attack-fields-live.jpg)

![강의에서 템플릿 전이 규칙을 설명하는 장면](../assets/images/template-transition-rule-live.jpg)

## 7. `Shinbi`와 `Wraith`는 같은 타이밍 규칙 위에서 다른 결과를 낸다

노티파이가 `NormalAttack()`을 호출하는 시점은 공통이다.
하지만 실제 내용은 캐릭터마다 다르다.

- `AShinbi::NormalAttack()`: 전방 캡슐 스윕 기반 근접 타격
- `AWraith::NormalAttack()`: `Muzzle_01` 소켓에서 `AWraithBullet` 스폰

즉 `260408`의 템플릿 구조는 결과를 통일하는 게 아니라, `타이밍 규칙을 공용화하고 결과는 캐릭터별로 남겨 둔다`는 설계다.

## 정리

현재 프로젝트 C++ 기준으로 보면 `260408`은 다음 호출 흐름을 만드는 날이다.

`AttackKey() -> InputAttack() -> PlayAttack()/PlaySkill1() -> Notify -> NormalAttack()/Skill1Casting()`

이 구조가 있어야 다음 날짜에서 데미지, 이펙트, 투사체, 피격 반응을 정확한 프레임에 붙일 수 있다.

[이전: 04 공식 문서](../04_appendix_official_docs_reference/) | [260408 허브](../) | [다음 날짜: 260409](../260409/)
