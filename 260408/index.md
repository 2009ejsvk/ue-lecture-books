---
title: 260408 플레이어 공격 애니메이션 구조
---

# 260408 플레이어 공격 애니메이션 구조

## 문서 개요

이 문서는 `260408_1`부터 `260408_3`까지의 강의를 하나의 연속된 교재로 다시 정리한 것이다.
이번 날짜의 핵심은 플레이어 공격을 "애니메이션 하나 재생" 수준이 아니라, 로코모션과 공존하는 전투 구조로 끌어올리는 데 있다.

강의 흐름을 한 줄로 요약하면 다음과 같다.

`AnimMontage / Slot -> Notify -> Combo Section -> Animation Template`

즉 `260408`은 나중에 나올 데미지, 이펙트, 투사체보다 한 단계 앞에 있는 교안이다.
공격 애니메이션을 어떤 재생 경로로 넣을지, 입력 허용 타이밍을 어떻게 제어할지, 캐릭터가 늘어나도 같은 구조를 어떻게 재사용할지를 먼저 정리한다.

이 교재는 아래 세 자료를 함께 대조해 작성했다.

- `D:\UE_Academy_Stduy_compressed`의 원본 영상과 자막
- 원본 영상에서 다시 추출한 대표 장면 캡처
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 C++ 소스

## 학습 목표

- `AnimMontage`와 `Slot`이 왜 로코모션 위에 공격을 얹는 데 필요한지 설명할 수 있다.
- 일반 `Notify`, `Notify State`, `UAnimNotify` 기반 커스텀 노티파이의 차이를 구분할 수 있다.
- `mAttackEnable`, `mComboEnable`, `mAttackIndex`가 콤보 입력 창과 어떻게 연결되는지 말할 수 있다.
- `PlayerTemplateAnimInstance`와 `TMap` 기반 에셋 매핑이 왜 템플릿 구조에 필요한지 설명할 수 있다.

## 강의 흐름 요약

1. 공격은 로코모션 그래프를 깨지 않도록 `AnimMontage`와 `Slot`으로 분리해 넣는다.
2. 특정 프레임에 일어날 일은 노티파이로 지정하고, 입력 창구도 노티파이로 연다.
3. 몽타주 섹션과 콤보 플래그를 이용해 `Attack1 -> Attack2 -> Attack3` 흐름을 만든다.
4. 마지막으로 공용 템플릿 애님 구조를 만들어 캐릭터별 차이는 에셋 매핑으로만 남긴다.

---

## 제1장. AnimMontage와 Slot: 로코모션 위에 공격을 얹는 법

### 1.1 왜 공격 애니메이션을 그래프 한가운데에 꽂으면 안 되는가

첫 강의의 출발점은 매우 현실적이다.
가만히 서서 공격만 하는 캐릭터라면 시퀀스 하나를 재생해도 되지만, 실제 플레이어는 이동, 점프, 시선 회전과 공격이 동시에 얽힌다.
그래서 공격 애니메이션을 로코모션 그래프 한가운데에 직접 섞어 넣기 시작하면 구조가 금방 무거워진다.

자막에서도 반복해서 나오듯, 이번 날짜의 핵심은 공격을 별도 계층으로 다루는 것이다.
평소에는 기존 로코모션 결과를 그대로 쓰고, 공격이 필요할 때만 다른 재생 경로로 얹는 식이어야 이동 중 공격도 자연스럽게 처리할 수 있다.

### 1.2 몽타주와 슬롯은 "별도 재생 경로"를 만든다

언리얼이 이 문제를 풀기 위해 제공하는 도구가 `AnimMontage`와 `Slot`이다.
몽타주는 시간축을 가진 전투용 애니메이션 자산이고, 슬롯은 그 몽타주가 애님 그래프 안으로 들어오는 통로다.

즉 평소에는 상태 머신과 로코모션이 결과를 내보내고, 공격할 때만 슬롯 노드가 몽타주 결과를 우선시한다.
이 구조 덕분에 점프, 시선 처리, 이동 속도 계산은 살리면서 공격 상체 애니메이션만 겹쳐 얹을 수 있다.

![몽타주와 슬롯을 연결한 애님 그래프](./assets/images/montage-slot-graph.jpg)

### 1.3 PlayerAnimInstance는 공격 몽타주와 섹션 정보를 들고 있다

실제 프로젝트에서 이 구조의 중심은 `UPlayerAnimInstance`다.
여기에는 공격 몽타주와 공격 섹션 배열, 그리고 콤보 상태를 관리할 값들이 모여 있다.

```cpp
UPROPERTY(EditAnywhere, BlueprintReadOnly)
TObjectPtr<UAnimMontage> mAttackMontage;

UPROPERTY(EditAnywhere, BlueprintReadOnly)
TArray<FName> mAttackSection;

int32 mAttackIndex = 0;
bool mComboEnable = false;
bool mAttackEnable = true;
```

이 필드들이 중요한 이유는 몽타주 재생을 단순 재생/정지 문제가 아니라 "어느 섹션을 언제 열 것인가"라는 전투 흐름으로 바꿔 주기 때문이다.

![공격 몽타주와 섹션 변수](./assets/images/montage-attack-vars.jpg)

### 1.4 PlayAttack은 첫 타와 연속 입력을 다른 규칙으로 처리한다

`PlayAttack()`은 이 강의의 중심 함수다.
공격이 시작되지 않은 상태라면 첫 섹션을 재생하고, 이미 공격 중이라면 현재 입력이 콤보로 인정되는지를 보고 다음 섹션으로 점프시킨다.

```cpp
if (mAttackEnable)
{
    if (!Montage_IsPlaying(mAttackMontage))
    {
        mAttackEnable = false;
        Montage_SetPosition(mAttackMontage, 0.f);
        Montage_Play(mAttackMontage, 1.f);
        Montage_JumpToSection(mAttackSection[0], mAttackMontage);
    }
}
else if (mComboEnable)
{
    mAttackIndex = (mAttackIndex + 1) % mAttackSection.Num();
    Montage_Play(mAttackMontage, 1.f);
    Montage_JumpToSection(mAttackSection[mAttackIndex], mAttackMontage);
    mComboEnable = false;
}
```

이 코드가 보여 주는 핵심은 버튼 하나가 상황에 따라 두 역할을 한다는 점이다.

- 공격이 시작되지 않았을 때는 "첫 타 시작"
- 콤보 입력 창이 열려 있을 때는 "다음 섹션으로 연장"

즉 공격 입력은 단순 트리거가 아니라, 현재 몽타주 상태를 읽고 분기하는 상태 기반 입력이 된다.

### 1.5 OnMontageEnded는 공격 상태를 정리하는 종료선이다

몽타주 구조를 썼다면 시작만큼 종료도 중요하다.
`UPlayerAnimInstance::NativeBeginPlay()`는 `OnMontageEnded` 델리게이트를 등록하고, 종료 시점에는 다시 기본 상태로 되돌린다.

```cpp
void UPlayerAnimInstance::NativeBeginPlay()
{
    Super::NativeBeginPlay();
    OnMontageEnded.AddDynamic(this, &UPlayerAnimInstance::MontageEnd);
}
```

그리고 `MontageEndOverride()`에서는 공격이 끝났을 때 플래그와 인덱스를 초기화한다.
이 정리 단계가 있어야 다음 공격이 다시 첫 타부터 정상적으로 시작된다.

![몽타주 종료 델리게이트 연결](./assets/images/montage-end-delegate.jpg)

### 1.6 장 정리

제1장의 결론은 분명하다.
공격 애니메이션을 잘 넣으려면 기존 로코모션 구조를 버리는 대신, 그 위에 얹히는 별도 경로를 만들어야 한다.
`AnimMontage`, `Slot`, 섹션, 종료 콜백이 바로 그 구조를 만든다.

---

## 제2장. 노티파이 종류: 특정 프레임에 무슨 일이 일어나야 하는가

### 2.1 노티파이는 애니메이션 안의 "시간표"다

두 번째 강의는 특정 프레임에 어떤 기능을 실행할지 정리한다.
콤보 입력 허용, 공격 판정 시작, 이펙트 재생, 사운드 재생은 모두 정확한 타이밍이 중요하다.
이 타이밍을 애니메이션 안에 심는 도구가 `Notify`다.

자막에서도 설명하듯, Notify는 "애니메이션이 재생되는 중 내가 지정한 시점에 어떤 일을 한 번 실행하게 해 주는 시스템"이다.
즉 전투 로직을 단순히 입력 시점에 몰아 넣지 않고, 실제 타격 프레임에 맞게 시간축에 배치할 수 있게 해 준다.

### 2.2 일반 Notify와 Notify State는 역할이 다르다

강의는 노티파이를 크게 두 갈래로 나눈다.

- 일반 `Notify`: 특정 프레임에서 한 번 실행
- `Notify State`: 시작과 끝이 있는 구간형 이벤트

사운드나 콤보 시작 신호처럼 한 번 찍고 끝나는 것은 일반 Notify가 잘 맞는다.
반대로 무기 트레일처럼 일정 구간 동안 유지되는 판정이나 이펙트는 Notify State가 더 자연스럽다.

![노티파이 타임라인과 섹션 구성](./assets/images/notify-timeline.jpg)

### 2.3 함수형 노티파이는 이름 규칙으로 연결된다

이번 프로젝트에서 자주 쓰는 방식은 일반 Notify 이름을 함수와 연결하는 방법이다.
예를 들어 애님 에디터에 `ComboStart`, `ComboEnd`를 배치하면, `UPlayerAnimInstance` 쪽에서는 `AnimNotify_ComboStart()`, `AnimNotify_ComboEnd()`를 구현해 바로 받을 수 있다.

```cpp
UFUNCTION()
void AnimNotify_ComboStart();

UFUNCTION()
void AnimNotify_ComboEnd();

void UPlayerAnimInstance::AnimNotify_ComboStart()
{
    mComboEnable = true;
}

void UPlayerAnimInstance::AnimNotify_ComboEnd()
{
    mComboEnable = false;
}
```

이 방식이 좋은 이유는 매우 단순하다.
콤보 입력 창구를 코드에서 하드코딩된 시간 값으로 관리하는 대신, 애니메이터가 몽타주 타임라인에서 직접 열고 닫을 수 있기 때문이다.

### 2.4 커스텀 UAnimNotify 클래스는 기능성 노티파이를 만든다

강의 후반은 `UAnimNotify`를 상속받는 커스텀 클래스 쪽으로 넘어간다.
이 방식은 단순 이름 신호보다 더 기능적인 노티파이가 필요할 때 쓰인다.

`AnimNotify_PlayerAttack`는 그 대표 예시다.
클래스 자체가 하나의 공격 판정 트리거가 되고, `Notify()` 안에서 플레이어의 `NormalAttack()`을 호출한다.

```cpp
void UAnimNotify_PlayerAttack::Notify(USkeletalMeshComponent* MeshComp,
    UAnimSequenceBase* Animation, const FAnimNotifyEventReference& EventReference)
{
    Super::Notify(MeshComp, Animation, EventReference);

    TObjectPtr<APlayerCharacter> PlayerChar = MeshComp->GetOwner<APlayerCharacter>();

    if (IsValid(PlayerChar))
    {
        PlayerChar->NormalAttack();
    }
}
```

![커스텀 노티파이 헤더](./assets/images/notify-custom-header.jpg)

![커스텀 노티파이 클래스 작성](./assets/images/notify-custom-class.jpg)

이 구조 덕분에 "공격 판정"이라는 기능 자체를 노티파이 자산처럼 타임라인에 배치할 수 있다.
즉 애님과 게임플레이 코드가 느슨하게 연결되면서도, 시점은 매우 정확하게 맞춰진다.

### 2.5 장 정리

제2장은 공격 시스템의 시간 제어를 담당한다.
노티파이가 없으면 콤보 입력 창구도, 판정 시작도, 이펙트 타이밍도 애매해진다.
일반 Notify, Notify State, 커스텀 `UAnimNotify`는 각각 다른 종류의 시간을 다루는 도구다.

---

## 제3장. 콤보 공격과 애니메이션 템플릿: 구조를 재사용 가능한 형태로 만들기

### 3.1 콤보는 버튼 연타가 아니라 "열린 창구 안의 연장 입력"이다

세 번째 강의는 앞에서 만든 노티파이 타이밍을 실제 콤보 로직과 연결한다.
중요한 점은 콤보를 단순 연타로 보지 않는다는 것이다.
언제 누르든 다음 타로 넘어가는 구조가 아니라, `ComboStart`와 `ComboEnd` 사이의 짧은 창구에서만 다음 입력을 인정한다.

그래서 `mComboEnable`이 필요하다.
이 값은 노티파이가 열어 준 짧은 시간 동안만 `true`가 되고, 그때 들어온 입력만 다음 섹션으로 넘어갈 자격을 얻는다.

### 3.2 mAttackEnable, mComboEnable, mAttackIndex가 콤보 상태를 만든다

실제 소스에서 콤보 구조의 핵심 상태는 세 가지다.

- `mAttackEnable`: 공격 시작 가능 여부
- `mComboEnable`: 다음 입력을 받을 수 있는지
- `mAttackIndex`: 현재 몇 번째 섹션까지 왔는지

![콤보 상태 플래그 코드](./assets/images/combo-flags-code.jpg)

이 세 값 덕분에 공격 버튼은 다음처럼 동작한다.

1. 아무 공격도 안 하는 중이면 `Attack1` 시작
2. 공격 중이지만 입력 창구가 닫혀 있으면 무시
3. 공격 중이고 `mComboEnable`이 켜져 있으면 `Attack2`, `Attack3`로 연장

즉 콤보는 복잡한 AI가 아니라, 상태 플래그와 섹션 이동만으로도 꽤 정교하게 구성할 수 있다.

### 3.3 템플릿은 공용 구조와 개별 자산을 분리한다

후반부는 `260409`로 이어지는 매우 중요한 발판이다.
강의는 여기서 애님 구조를 템플릿으로 뽑아내기 시작한다.
공용 플레이어 구조는 부모 템플릿에 두고, 캐릭터별 차이는 그 위에 얹는 방식이다.

`UPlayerTemplateAnimInstance`는 `UPlayerAnimInstance`를 상속하면서, 각 캐릭터가 사용할 시퀀스나 블렌드 스페이스를 `TMap`으로 보관한다.

```cpp
UCLASS()
class UE20252_API UPlayerTemplateAnimInstance : public UPlayerAnimInstance
{
    GENERATED_BODY()

protected:
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    TMap<FString, TObjectPtr<UAnimSequence>> mAnimMap;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    TMap<FString, TObjectPtr<UBlendSpace>> mBlendSpaceMap;
};
```

즉 공용 그래프와 전투 로직은 유지하고, 실제로 재생할 자산만 캐릭터별로 바꿔 꽂는 구조가 된다.

![템플릿 애님 그래프](./assets/images/template-graph.jpg)

### 3.4 템플릿은 260409의 실제 공격/이펙트 확장을 준비한다

이번 날짜 교재가 중요한 이유는 여기서 끝나지 않기 때문이다.
`260409`에서는 이 기반 위에 실제 공격 판정, `TakeDamage`, 파티클, 사운드, 원거리 투사체까지 붙는다.

즉 `260408`은 다음을 준비한 날이다.

- 공격을 별도 재생 경로로 다루는 몽타주 구조
- 노티파이로 열고 닫는 입력 창구
- 콤보를 제어하는 섹션과 플래그
- 캐릭터가 늘어나도 유지 가능한 템플릿 구조

![템플릿 자산 매핑](./assets/images/template-asset-map.jpg)

### 3.5 장 정리

제3장은 공격 애님 구조를 일회성 구현이 아니라 재사용 가능한 시스템으로 바꾼다.
콤보는 노티파이와 섹션으로 제어하고, 공용 그래프는 템플릿으로 고정해 캐릭터별 차이는 자산 매핑으로 처리한다.

---

## 전체 정리

`260408`을 층으로 다시 정리하면 다음과 같다.

1. `AnimMontage`와 `Slot`이 공격의 별도 재생 경로를 만든다.
2. `Notify`와 `UAnimNotify`가 전투 타이밍을 애니메이션 안에 심는다.
3. `mAttackEnable`, `mComboEnable`, `mAttackIndex`가 콤보 입력 규칙을 만든다.
4. `PlayerTemplateAnimInstance`가 이 구조를 캐릭터 공용 템플릿으로 끌어올린다.

즉 이번 날짜는 전투 "결과"보다 전투 "구조"를 만드는 날이다.
실제 판정과 이펙트는 다음 단계에서 붙지만, 그 모든 것은 여기서 만든 시간 제어와 템플릿 구조 위에 올라간다.

## 복습 체크리스트

- 공격 애니메이션을 로코모션 그래프에 직접 섞지 않고 몽타주/슬롯으로 분리하는 이유를 설명할 수 있는가
- `mAttackMontage`와 `mAttackSection`이 각각 어떤 역할을 하는지 구분할 수 있는가
- `ComboStart`, `ComboEnd` 노티파이가 왜 입력 창구를 열고 닫는 데 적합한지 설명할 수 있는가
- 일반 Notify, Notify State, 커스텀 `UAnimNotify`의 차이를 말할 수 있는가
- `PlayAttack()`이 첫 타 시작과 콤보 연장을 어떻게 다르게 처리하는지 설명할 수 있는가
- 템플릿 구조가 캐릭터별 애님 블루프린트 복제를 어떻게 줄이는지 설명할 수 있는가

## 세미나 질문

1. 공격을 몽타주로 분리하지 않고 상태 머신 내부에서만 처리하면 어떤 유지보수 문제가 생길까
2. 콤보 입력 창구를 코드 타이머가 아니라 노티파이로 여닫는 방식의 장점은 무엇일까
3. `UAnimNotify` 기반 클래스형 노티파이는 어떤 종류의 기능에서 특히 유리할까
4. 템플릿 애님 구조를 도입할 때 공용화와 캐릭터 개성 사이의 경계는 어디에 두는 것이 좋을까

## 권장 과제

1. 공격 몽타주에 `Attack4` 섹션을 추가하고, `mAttackSection` 배열만 바꿔서 4단 콤보가 이어지는지 실험한다.
2. `ComboStart`와 `ComboEnd` 위치를 앞뒤로 옮겨 보면서 콤보 체감이 어떻게 바뀌는지 기록한다.
3. `AnimNotify_PlayerAttack`와 비슷한 방식으로 `AnimNotify_PlayFootstep` 같은 커스텀 노티파이를 설계해 본다.
4. `PlayerTemplateAnimInstance`에 몽타주나 스킬 섹션 매핑까지 확장했을 때 어떤 관리 방식이 더 적절한지 비교한다.
