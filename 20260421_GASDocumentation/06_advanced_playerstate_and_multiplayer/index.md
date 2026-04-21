---
title: 20260421 고급 2편 - PlayerState와 멀티플레이 구조
---

# 고급 2편. PlayerState와 멀티플레이 구조

[이전: 고급 1편](../05_advanced_firegun_and_damage_pipeline/) | [허브](../) | [다음: 부록](../07_appendix_cheatsheet/)

## 이 편의 목표

이 편에서는 왜 이 예제가 `PlayerState`에 ASC를 두는지, 그리고 `OwnerActor`와 `AvatarActor`를 어떻게 연결하는지 본다.

이 파트가 어려운 이유는, 여기서부터는 “기능 설명”보다 “멀티플레이 배치 설명” 비중이 커지기 때문이다.
그래서 이 편은 고급으로 분리했다.

## 봐야 할 파일

- `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Player\GDPlayerState.cpp`
- `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Characters\Heroes\GDHeroCharacter.cpp`
- `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Public\Characters\GDCharacterBase.h`

## 이 예제의 배치

- `PlayerState`
  ASC와 AttributeSet 소유
- `Character`
  실제 몸체와 입력 담당

즉 이 예제는 `Character가 ASC를 직접 만드는 구조`가 아니라,
`Character가 PlayerState의 ASC를 참조해서 쓰는 구조`다.

## 왜 PlayerState에 ASC를 둘까

멀티플레이에서는 캐릭터가 죽고 리스폰할 수 있지만, PlayerState는 플레이어의 더 지속적인 상태를 들고 있다.
그래서 ASC를 PlayerState에 두면 아래 장점이 생긴다.

- 플레이어의 전투 상태를 더 안정적으로 유지하기 쉽다
- 리스폰 구조와 연결하기 좋다
- 멀티플레이 복제 패턴에 잘 맞는다

즉 이건 단순 취향이 아니라, 멀티플레이 정석 패턴에 가깝다.

## `GDPlayerState`가 하는 일

`AGDPlayerState`는 생성자에서 아래를 만든다.

- `AbilitySystemComponent`
- `AttributeSetBase`

그리고 `BeginPlay()`에서는 Attribute 변경 delegate와 Tag 변경 delegate를 등록한다.

즉 PlayerState는 단순 보관함이 아니라 아래 역할도 한다.

- Attribute 변화 감시
- UI 반영
- 죽음 상태 체크
- 스턴 태그가 생기면 Ability 취소

## `GDHeroCharacter::PossessedBy()`는 서버 쪽 연결 지점

서버에서는 `PossessedBy()`에서 아래를 한다.

1. PlayerState 가져오기
2. PlayerState 안의 ASC 참조 가져오기
3. `InitAbilityActorInfo(PS, this)` 호출
4. AttributeSet 참조 저장
5. 초기화와 Ability 지급

여기서 핵심 한 줄은 아래다.

```cpp
PS->GetAbilitySystemComponent()->InitAbilityActorInfo(PS, this);
```

즉 이 예제는 아래 관계를 명시한다.

- `OwnerActor = PlayerState`
- `AvatarActor = Character`

## `OnRep_PlayerState()`는 클라이언트 쪽 연결 지점

클라이언트는 possession 타이밍이 서버와 다르기 때문에 `OnRep_PlayerState()`에서 거의 같은 연결을 다시 한다.

즉 이 예제는 아래처럼 보면 된다.

- 서버
  `PossessedBy()`
- 클라이언트
  `OnRep_PlayerState()`

그리고 두 곳 모두에서 결국 하는 핵심은 같다.

- ASC 참조 확보
- `InitAbilityActorInfo(PS, this)`
- 입력 바인딩
- AttributeSet 참조 확보

## 왜 `BeginPlay()`에서 다 안 하나

예제 주석이 이 부분을 잘 설명한다.

- 서버에서는 Possession이 `BeginPlay()`보다 먼저 오기도 한다
- 클라이언트에서는 `BeginPlay()`가 먼저고, PlayerState 복제가 나중일 수도 있다

즉 `BeginPlay()` 하나에 몰아넣으면 타이밍 이슈가 생길 수 있다.
그래서 possession/replication 지점에서 따로 연결하는 구조를 쓴다.

## 초심자용 코드 읽기

먼저 `GDPlayerState` 생성자부터 보자.

```cpp
AGDPlayerState::AGDPlayerState()
{
    // ASC를 PlayerState 안에 만든다.
    AbilitySystemComponent = CreateDefaultSubobject<UGDAbilitySystemComponent>(
        TEXT("AbilitySystemComponent"));

    // 네트워크 복제를 켠다.
    AbilitySystemComponent->SetIsReplicated(true);

    // GameplayEffect 복제 방식을 Mixed로 설정한다.
    AbilitySystemComponent->SetReplicationMode(EGameplayEffectReplicationMode::Mixed);

    // AttributeSet도 PlayerState 안에 만든다.
    // ASC 소유 액터의 서브오브젝트로 만들면 자동 등록된다.
    AttributeSetBase = CreateDefaultSubobject<UGDAttributeSetBase>(TEXT("AttributeSetBase"));

    // PlayerState는 기본 NetUpdateFrequency가 낮아서,
    // 예제에서는 GAS 반응이 느려 보이지 않게 값을 높인다.
    NetUpdateFrequency = 100.0f;

    DeadTag = FGameplayTag::RequestGameplayTag(FName("State.Dead"));
}
```

이 코드가 말하는 건 간단하다.

- 이 예제는 ASC를 Character가 아니라 PlayerState가 소유한다
- AttributeSet도 PlayerState가 가진다

서버에서 Character와 연결하는 코드는 `PossessedBy()`에 있다.

```cpp
void AGDHeroCharacter::PossessedBy(AController* NewController)
{
    Super::PossessedBy(NewController);

    AGDPlayerState* PS = GetPlayerState<AGDPlayerState>();
    if (PS)
    {
        // PlayerState 안의 ASC를 Character가 참조한다.
        AbilitySystemComponent = Cast<UGDAbilitySystemComponent>(PS->GetAbilitySystemComponent());

        // Owner는 PlayerState, Avatar는 Character로 연결한다.
        PS->GetAbilitySystemComponent()->InitAbilityActorInfo(PS, this);

        // AttributeSet도 Character 쪽 포인터에 잡아 둔다.
        AttributeSetBase = PS->GetAttributeSetBase();

        // 이제부터 Character는 이 ASC/AttributeSet을 써서 전투를 수행한다.
        InitializeAttributes();
        AddStartupEffects();
        AddCharacterAbilities();
    }
}
```

즉 서버는 possession 시점에 아래를 한다.

1. PlayerState 확보
2. ASC 참조 가져오기
3. `InitAbilityActorInfo(PS, this)` 호출
4. 초기화와 Ability 지급

클라이언트는 같은 일을 `OnRep_PlayerState()`에서 한다.

```cpp
void AGDHeroCharacter::OnRep_PlayerState()
{
    Super::OnRep_PlayerState();

    AGDPlayerState* PS = GetPlayerState<AGDPlayerState>();
    if (PS)
    {
        // 서버는 PossessedBy에서 했지만,
        // 클라이언트는 PlayerState가 복제된 뒤 여기서 연결한다.
        AbilitySystemComponent = Cast<UGDAbilitySystemComponent>(PS->GetAbilitySystemComponent());

        AbilitySystemComponent->InitAbilityActorInfo(PS, this);

        // 입력 바인딩도 여기서 다시 시도한다.
        BindASCInput();

        AttributeSetBase = PS->GetAttributeSetBase();
        InitializeAttributes();
    }
}
```

이 구조를 초심자 시점에서 아주 짧게 요약하면 이렇다.

- `PlayerState`
  전투 시스템 본체 보관
- `Character`
  실제 몸과 입력
- `InitAbilityActorInfo(PS, this)`
  둘을 연결하는 핵심 함수

## 이 편의 핵심 정리

이 예제는 멀티플레이 기준 정석 구조를 보여 준다.

`PlayerState가 ASC와 AttributeSet을 소유하고, Character는 Avatar로서 실제 몸체와 입력을 담당한다.`

이 구조는 처음 배울 때는 무겁지만, Ability와 Attribute 흐름을 먼저 본 뒤에 오면 훨씬 이해하기 쉽다.

## 공식 문서 연결

- [Understanding the Unreal Engine Gameplay Ability System](https://dev.epicgames.com/documentation/en-us/unreal-engine/understanding-the-unreal-engine-gameplay-ability-system)
  Epic은 ASC가 Ability, Attribute, Tag, Gameplay Event, 진행 중인 Effect를 추적하는 핵심 인터페이스라고 설명한다. 이 예제가 PlayerState에 ASC를 두는 이유를 이해할 때 중심 문서가 된다.

- [Using Gameplay Abilities in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-abilities-in-unreal-engine)
  이 문서는 Ability가 네트워크에서 복제될 수 있고, `Local Predicted` 같은 실행 정책을 가질 수 있다고 설명한다. 즉 `Owner/Avatar`, 서버/클라 초기화, 예측 실행을 함께 생각해야 하는 이유가 여기에 있다.

- [Using Gameplay Tags in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-tags-in-unreal-engine?application_version=5.7)
  태그는 멀티플레이 상태 표현에서도 중요하다. 이 예제에서 `State.Dead`나 `State.Debuff.Stun` 같은 태그를 PlayerState/ASC가 감시하는 이유를 공식 문서 관점에서 다시 볼 수 있다.

## 다음 편

[부록. GAS 함수 치트시트와 추천 파일 순서](../07_appendix_cheatsheet/)
