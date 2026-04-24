---
title: 260408 01 AnimMontage와 Slot으로 공격 재생 경로 만들기
---

# 260408 01 AnimMontage와 Slot으로 공격 재생 경로 만들기

[← 260407](../260407/) | [260408 허브](../) | [다음: 02 노티파이](../02_intermediate_animation_notifies_and_custom_notify/)

## 왜 이 파트가 먼저인가

공격 애니메이션을 전투 구조로 만들려면 먼저 "어디로 재생할 것인가"부터 정해야 한다.
`260408`의 첫 강의는 바로 그 문제를 다룬다.

즉 평소 이동과 점프는 기존 로코모션이 처리하고, 공격이 필요할 때만 별도 통로를 통해 애니메이션을 얹는 구조를 만든다.

## 1. 로코모션 위에 공격을 직접 꽂지 않는 이유

상태 머신 안에서 이동, 점프, 공격, 피격, 스킬을 모두 직접 섞기 시작하면 그래프가 금방 무거워진다.
그래서 언리얼은 전투성 애니메이션에 `AnimMontage`와 `Slot`을 따로 둔다.

- `AnimMontage`: 시간축과 섹션을 가진 전투용 자산
- `Slot`: 그 몽타주가 애님 그래프 안으로 들어오는 통로

이렇게 나누면 이동은 계속 유지하면서도, 필요한 순간에만 공격을 겹쳐 얹을 수 있다.

![몽타주와 슬롯을 연결한 애님 그래프](../assets/images/montage-slot-graph.jpg)

## 2. 현재 프로젝트에서 슬롯 규약이 어떻게 잡혀 있는가

지금 프로젝트의 템플릿 애님 구조를 보면 이 설명이 개념 수준에 그치지 않는다.
`ABPPlayerTemplate` 계열 그래프는 `Locomotion` 캐시 포즈를 먼저 만들고, 그 결과를 `TemplateFullBody` 슬롯으로 보낸 뒤 다시 `FullBody` 캐시 포즈로 정리한다.

즉 현재 branch에서 공격 몽타주는 "아무 그래프나 끼워 넣는 자산"이 아니라, 공통 슬롯 규약을 통해서만 들어오도록 설계되어 있다.

## 3. `UPlayerAnimInstance`가 들고 있는 전투용 필드

`UPlayerAnimInstance`는 단순히 애니메이션 재생만 하는 객체가 아니다.
공격 몽타주와 섹션 이름, 콤보 상태를 한곳에 모아 두는 전투용 컨트롤 타워에 가깝다.

```cpp
UPROPERTY(EditAnywhere, BlueprintReadOnly)
TObjectPtr<UAnimMontage> mAttackMontage;

UPROPERTY(EditAnywhere, BlueprintReadOnly)
TArray<FName> mAttackSection;

int32 mAttackIndex = 0;
bool mComboEnable = false;
bool mAttackEnable = true;
```

이 구조 덕분에 공격은 "애니메이션 하나 재생"이 아니라, "어느 섹션을 언제 열 것인가"를 다루는 시간 제어 문제가 된다.

![공격 몽타주와 섹션 변수](../assets/images/montage-attack-vars.jpg)

## 4. `PlayAttack()`은 첫 타 시작과 다음 타 연장을 다르게 본다

`PlayAttack()`은 버튼을 하나 받지만 실제로는 두 상황을 나눠 처리한다.

- 아직 공격 중이 아니면 첫 섹션부터 시작
- 이미 공격 중이고 입력 창구가 열려 있으면 다음 섹션으로 점프

즉 같은 공격 버튼이라도 "처음 시작"과 "콤보 연장"이 완전히 같은 의미는 아니다.
이 개념이 뒤의 `ComboStart`, `ComboEnd` 노티파이와 연결된다.

## 5. 몽타주 종료선은 `OnMontageEnded`가 담당한다

몽타주 구조를 썼다면 시작만큼 종료 처리도 중요하다.
현재 코드에서 `UPlayerAnimInstance::NativeBeginPlay()`는 `OnMontageEnded.AddDynamic(...)`를 등록하고, `MontageEndOverride()`는 공격이 끝났을 때 `mAttackEnable`, `mComboEnable`, `mAttackIndex`를 초기화한다.

즉 몽타주 종료 훅이 있어야 다음 공격이 다시 1타부터 자연스럽게 시작된다.

![몽타주 종료 델리게이트 연결](../assets/images/montage-end-delegate.jpg)

![강의에서 `NativeBeginPlay`를 설명하는 장면](../assets/images/montage-nativebeginplay-live.jpg)

## 6. 현재 branch 추적 메모

강의 당시 문맥은 `APlayerCharacter` 중심이지만, 현재 `UE20252` branch의 `NativeUpdateAnimation()`은 `TryGetPawnOwner()`를 `APlayerCharacterGAS`로 형변환한다.
즉 공격 몽타주 구조 자체는 유지되지만, 최신 구현에서는 이 애님 인스턴스가 GAS 플레이어 라인을 기준으로 동작한다.

## 정리

이 편의 핵심은 `공격을 위한 별도 재생 경로를 만든다`는 점이다.
이 경로 위에 다음 편의 `Notify`, 그다음 편의 `Combo Section`과 `Animation Template`이 차례대로 올라간다.

[← 260407](../260407/) | [260408 허브](../) | [다음: 02 노티파이](../02_intermediate_animation_notifies_and_custom_notify/)
