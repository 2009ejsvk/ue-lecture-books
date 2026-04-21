---
title: 260409 플레이어 전투 파이프라인 기초
---

# 260409 플레이어 전투 파이프라인 기초

## 문서 개요

이 문서는 `260409_1`부터 `260409_3`까지의 강의를 하나의 연속된 교재로 다시 정리한 것이다.
이번 날짜의 핵심은 "플레이어가 공격한다"는 문장을 실제 언리얼 시스템으로 풀어내는 데 있다.

강의 흐름을 한 줄로 요약하면 다음과 같다.

`공용 애님 템플릿 -> 충돌 채널 / 프로파일 -> Sweep / TakeDamage -> 파티클 / 사운드 / 탄환`

즉 애니메이션, 충돌, 데미지, 이펙트가 별개의 기능으로 흩어져 있는 것이 아니라, 하나의 전투 파이프라인으로 연결된다는 점을 보여 주는 날이다.
애님 템플릿이 입력과 몽타주 재생을 정리하고, 충돌 시스템이 판정 규칙을 제공하며, 데미지 함수와 이펙트 시스템이 맞았을 때의 결과를 완성한다.

이 교재는 아래 세 자료를 함께 대조해 작성했다.

- `D:\UE_Academy_Stduy_compressed`의 원본 영상과 자막
- 원본 영상에서 다시 추출한 대표 장면 캡처
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`의 실제 C++ 소스

## 학습 목표

- `UPlayerTemplateAnimInstance`가 왜 공용 베이스로 필요한지 설명할 수 있다.
- 충돌 `채널`, `프로파일`, `응답`, `Sweep`의 차이를 구분할 수 있다.
- `AnimNotify -> NormalAttack -> SweepMultiByChannel -> TakeDamage` 흐름을 말할 수 있다.
- `SpawnSoundAtLocation`, `SpawnEmitterAtLocation`, `SpawnDecalAtLocation`, `ProjectileMovement`가 각각 어떤 시점에 쓰이는지 설명할 수 있다.

## 강의 흐름 요약

1. 플레이어 공용 애님 로직을 템플릿 인스턴스로 올리고, 캐릭터별 차이는 에셋 매핑으로 남긴다.
2. 프로젝트 전체 충돌 규칙을 `Project Settings -> Collision` 기준으로 다시 설계한다.
3. 공격 노티파이에서 실제 판정 함수를 호출하고, 데미지 시스템과 연결한다.
4. 마지막으로 사운드, 파티클, 데칼, 투사체를 붙여 타격 피드백을 완성한다.

---

## 제1장. 애니메이션 템플릿: 공용 플레이어 전투 입력 만들기

### 1.1 왜 캐릭터별 애님 그래프를 그대로 두면 안 되는가

첫 강의의 핵심은 "플레이어 캐릭터가 여러 명이어도 전투 구조는 비슷하다"는 판단이다.
Shinbi와 Wraith는 외형과 스킬은 다르지만, 이동, 점프, 공격, 스킬 같은 기본 루프는 거의 같다.
그래서 강의는 캐릭터마다 애님 로직을 복제하지 않고, 공용 템플릿을 먼저 만든다.

자막에서도 반복해서 강조하는 지점이 바로 이것이다.
템플릿은 모든 애셋을 공용으로 만들겠다는 뜻이 아니라, 그래프 구조와 상태 계산 로직을 공유하겠다는 뜻이다.
즉 재사용의 대상은 "애님 그래프의 뼈대"다.

### 1.2 PlayerAnimInstance가 공통 상태를 모으는 방식

실제 프로젝트에서 공용 애님 상태 계산은 `UPlayerAnimInstance`에 들어 있다.
이 클래스는 플레이어의 이동 속도, 공중 여부, 가속 여부, 회전 변화량을 매 프레임 계산해 애님 블루프린트가 읽을 수 있게 만든다.

```cpp
TObjectPtr<APlayerCharacter> PlayerChar = Cast<APlayerCharacter>(TryGetPawnOwner());

if (IsValid(PlayerChar))
{
    UCharacterMovementComponent* Movement = PlayerChar->GetCharacterMovement();

    mMoveSpeed = Movement->Velocity.Length();
    mIsInAir = Movement->IsFalling();
    mAccelerating = Movement->GetCurrentAcceleration().Length() > 0.f;

    FRotator CurrentRot = PlayerChar->GetActorRotation();
    FRotator DeltaRot = UKismetMathLibrary::NormalizedDeltaRotator(CurrentRot, mPrevRotator);
    float DeltaYaw = DeltaRot.Yaw / DeltaSeconds / 7.f;
    mYawDelta = FMath::FInterpTo(mYawDelta, DeltaYaw, DeltaSeconds, 6.f);
    mPrevRotator = CurrentRot;
}
```

이 코드는 단순한 상태 수집처럼 보이지만, 사실상 "애님 그래프가 물어볼 공용 인터페이스"를 만드는 단계다.
이 값들이 공통으로 정리돼 있어야 캐릭터마다 그래프를 다시 짜지 않고도 같은 Locomotion 구조를 유지할 수 있다.

![템플릿 애님 인스턴스 클래스](./assets/images/anim-template-graph.jpg)

### 1.3 PlayerTemplateAnimInstance는 공용 구조와 개별 에셋을 분리한다

`UPlayerTemplateAnimInstance`는 `UPlayerAnimInstance`를 상속하면서, 캐릭터별 에셋 차이를 `TMap`으로 분리한다.

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

이 설계가 좋은 이유는 템플릿이 요구하는 이름만 맞으면, Shinbi든 Wraith든 다른 애님 자산을 꽂아 넣을 수 있기 때문이다.
즉 구조는 공용, 재생 대상은 개별 에셋이라는 분리가 성립한다.

![Wraith 템플릿 애님 블루프린트 구성](./assets/images/anim-template-wraith.jpg)

### 1.4 몽타주와 노티파이는 "공격 시점"을 코드에 넘겨 준다

이 강의에서 중요한 점은 애님 템플릿이 단순히 이동 그래프만 재사용하는 것이 아니라, 전투 입력도 코드와 정확히 연결한다는 데 있다.
`UPlayerAnimInstance`는 몽타주 재생, 콤보 섹션 이동, 종료 시점 정리를 맡고, 노티파이는 실제 판정 호출 타이밍을 만든다.

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

이제 공격 버튼을 눌렀을 때의 의미는 단순히 몽타주를 재생하는 것에서 끝나지 않는다.
애님 안의 정확한 타격 프레임에서 `NormalAttack()`이 호출되고, 그 다음 장에서 다룰 충돌 판정과 데미지 처리가 연결된다.

### 1.5 장 정리

제1장의 결론은 분명하다.
전투 애니메이션을 잘 정리하려면 캐릭터별 블루프린트를 복제하는 대신, 공용 상태 계산과 공용 몽타주 흐름을 먼저 추상화해야 한다.
`260409`의 전반부는 그 바닥을 `PlayerAnimInstance`와 `PlayerTemplateAnimInstance`로 깔고 있다.

---

## 제2장. 충돌 시스템: 판정을 프로젝트 규칙으로 끌어올리기

### 2.1 충돌은 액터별 설정이 아니라 프로젝트 규칙이다

두 번째 강의는 언리얼 충돌 시스템을 처음부터 다시 정리한다.
자막에서도 계속 나오듯, 언리얼 충돌은 단순히 충돌체 하나 붙여 두는 수준이 아니라 `채널`, `프로파일`, `응답`을 프로젝트 단위로 설계하는 체계다.

그래서 강의는 개별 액터보다 먼저 `Project Settings -> Engine -> Collision`으로 들어간다.
여기서 오브젝트 채널, 트레이스 채널, 기본 프리셋과 커스텀 프로파일을 함께 설계해야 이후 코드가 단순해진다.

![Collision 프로젝트 설정](./assets/images/collision-settings.jpg)

### 2.2 오브젝트 채널과 트레이스 채널의 차이

강의가 특히 강조하는 부분은 오브젝트 채널과 트레이스 채널을 섞어 생각하지 말라는 점이다.

- `오브젝트 채널`: 이 충돌체가 무엇인가
- `트레이스 채널`: 내가 지금 어떤 기준으로 검사하는가

예를 들어 플레이어 몸체, 몬스터 몸체, 공격 판정은 오브젝트 성격이 다르고, 카메라 가림 체크나 공격 Sweep은 또 다른 질의다.
이 둘을 분리해 생각해야 "누구를 막고, 누구를 무시하고, 누구를 맞출 것인가"를 설계할 수 있다.

### 2.3 프로파일은 액터 설정을 줄여 주는 규칙 묶음이다

자막 후반부에는 커스텀 채널과 함께 프로파일을 같이 설계해야 한다는 설명이 나온다.
이 말은 중요하다.
채널만 만들고 액터마다 응답을 개별로 손대면 결국 프로젝트가 금방 지저분해진다.

그래서 `Player`, `Monster`, `PlayerAttack` 같은 프로파일을 준비해 두면, 캐릭터 쪽 코드는 훨씬 읽기 쉬워진다.
실제 소스에서도 플레이어 캡슐과 탄환 바디에 프로파일 이름을 바로 부여한다.

```cpp
GetCapsuleComponent()->SetCollisionProfileName(TEXT("Player"));
...
mBody->SetCollisionProfileName(TEXT("PlayerAttack"));
```

![충돌 프로파일 적용 장면](./assets/images/collision-profiles.jpg)

### 2.4 공격 판정은 상시 충돌체보다 쿼리 기반 Sweep이 더 낫다

강의의 실전 포인트는 여기서 나온다.
항상 큰 충돌체를 몸에 붙여 두는 방식보다, 실제 공격 순간에만 `Overlap`이나 `Sweep` 계열 쿼리를 호출하는 편이 훨씬 제어하기 쉽다.
이번 프로젝트는 특히 `캡슐 Sweep`을 중심으로 설명된다.

```cpp
bool Collision = GetWorld()->SweepMultiByChannel(
    HitArray,
    StartLoc,
    EndLoc,
    CapsuleRot,
    ECollisionChannel::ECC_GameTraceChannel3,
    FCollisionShape::MakeCapsule(35.f, 100.f),
    param);
```

이 설계의 장점은 명확하다.

- 공격 프레임에만 판정을 계산한다.
- 캡슐이나 구체 같은 원하는 도형을 쓸 수 있다.
- 커스텀 트레이스 채널을 이용해 맞춰야 할 대상만 골라낼 수 있다.

![공격 테스트 장면](./assets/images/collision-attack-test.jpg)

### 2.5 애님 타임라인과 판정 시점을 맞추는 이유

충돌 강의 중간에는 애님 시퀀스나 타임라인에서 공격 타격 지점을 맞추는 장면도 나온다.
이 장면은 제1장과 제2장을 잇는 핵심 연결점이다.

버튼 입력 시점에 바로 Sweep을 날리면 애니메이션과 체감 타격이 어긋난다.
반대로 노티파이를 써서 "칼날이 실제로 닿는 프레임"에 쿼리를 실행하면 판정과 연출이 자연스럽게 맞아떨어진다.

![공격 노티파이 타이밍 정리](./assets/images/collision-notify-track.jpg)

### 2.6 장 정리

제2장의 결론은, 충돌은 전투 기능의 하위 디테일이 아니라 전투 시스템의 규칙 언어라는 점이다.
채널과 프로파일을 설계하고, 노티파이 시점에 맞춰 Sweep을 호출해야 전투 판정이 안정적으로 작동한다.

---

## 제3장. 데미지, 파티클, 사운드, 투사체: 맞았다는 결과를 완성하기

### 3.1 언리얼은 이미 데미지 뼈대를 제공한다

세 번째 강의의 출발점은 `ApplyDamage`와 `TakeDamage`다.
직접 데미지 시스템을 처음부터 짜는 대신, 언리얼이 제공하는 액터 계층의 데미지 뼈대를 활용하는 흐름으로 들어간다.

`APlayerCharacter`도 `TakeDamage`를 오버라이드하고 있고, Shinbi의 근접 공격은 Sweep으로 맞은 액터에게 `TakeDamage`를 직접 호출한다.

```cpp
float APlayerCharacter::TakeDamage(float DamageAmount,
    const FDamageEvent& DamageEvent, AController* EventInstigator,
    AActor* DamageCauser)
{
    float Dmg = Super::TakeDamage(DamageAmount, DamageEvent, EventInstigator, DamageCauser);

    GEngine->AddOnScreenDebugMessage(-1, 10.f, FColor::Red,
        FString::Printf(TEXT("Dmg : %.5f"), Dmg));

    return Dmg;
}
```

이 코드를 보면 이번 강의의 방향이 잘 드러난다.
데미지는 "누가 언제 맞았는가"라는 게임 로직이고, 출력 메시지는 현재 파이프라인이 정상 동작하는지 확인하는 첫 번째 디버깅 수단이다.

![TakeDamage 연결 코드](./assets/images/damage-code-takedamage.jpg)

### 3.2 Shinbi 근접 공격은 Sweep 결과에 이펙트를 덧붙인다

Shinbi의 `NormalAttack()`은 이번 날짜 강의 전체를 가장 잘 보여 주는 예제다.
이 함수 안에는 전투 파이프라인의 핵심 요소가 모두 들어 있다.

1. 캡슐 Sweep으로 히트 후보를 찾는다.
2. 맞은 액터에 `TakeDamage`를 호출한다.
3. 충돌 지점에 사운드를 재생한다.
4. 같은 지점에 파티클을 재생한다.

```cpp
for (auto Hit : HitArray)
{
    FDamageEvent DmgEvent;
    Hit.GetActor()->TakeDamage(100.f, DmgEvent, GetController(), this);

    TObjectPtr<USoundBase> Sound = LoadObject<USoundBase>(
        GetWorld(), TEXT("/Script/Engine.SoundWave'/Game/Sound/Effect/Fire1.Fire1'"));

    if (IsValid(Sound))
    {
        UGameplayStatics::SpawnSoundAtLocation(GetWorld(), Sound, Hit.ImpactPoint);
    }

    TObjectPtr<UParticleSystem> Particle = LoadObject<UParticleSystem>(
        GetWorld(), TEXT("/Script/Engine.ParticleSystem'/Game/ParagonShinbi/FX/Particles/Abilities/Primary/FX/P_Mudang_Primary_Impact.P_Mudang_Primary_Impact'"));

    if (IsValid(Particle))
    {
        UGameplayStatics::SpawnEmitterAtLocation(GetWorld(), Particle, Hit.ImpactPoint);
    }
}
```

![데미지 후 사운드와 파티클 연결](./assets/images/damage-sound-particle-code.jpg)

이 함수가 좋은 이유는, 공격 로직이 단순히 HP를 깎는 것으로 끝나지 않고 "맞았다는 감각"까지 한곳에서 완성되기 때문이다.

### 3.3 Wraith는 근접 판정 대신 투사체 기반 공격으로 확장한다

강의 후반은 같은 전투 파이프라인을 원거리 캐릭터로 확장하는 방식으로 읽을 수 있다.
Wraith는 직접 Sweep을 하지 않고, 총알 액터를 발사한다.

```cpp
void AWraith::NormalAttack()
{
    FVector MuzzleLoc = GetMesh()->GetSocketLocation(TEXT("Muzzle_01"));

    FActorSpawnParameters param;
    param.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

    GetWorld()->SpawnActor<AWraithBullet>(MuzzleLoc, GetActorRotation(), param);
}
```

즉 "공격 즉시 판정"을 하던 근접형 구조가 "공격 시 탄환을 만들어 판정을 위임"하는 원거리 구조로 바뀐다.
하지만 전체 파이프라인은 여전히 같다.
몽타주, 노티파이, 판정, 데미지, 이펙트라는 순서는 유지된다.

![Wraith 투사체 테스트 장면](./assets/images/projectile-preview.jpg)

### 3.4 ProjectileBase와 WraithBullet이 런타임 효과를 마무리한다

원거리 파트에서 기반 클래스 역할을 하는 것은 `AProjectileBase`다.
이 클래스는 `UBoxComponent`와 `UProjectileMovementComponent`를 기본으로 제공하고, 이동을 충돌체에 연결해 탄환처럼 동작하게 만든다.

그 위에서 `AWraithBullet`은 실제 시각 효과를 채운다.

- 비행 중 파티클 컴포넌트
- 충돌 시 히트 파티클
- 충돌 시 사운드
- 충돌 시 데칼
- 중력 제거와 초기 속도 설정

```cpp
if (IsValid(mHitParticle))
{
    UGameplayStatics::SpawnEmitterAtLocation(GetWorld(), mHitParticle, Hit.ImpactPoint);
}

if (IsValid(mHitSound))
{
    UGameplayStatics::SpawnSoundAtLocation(GetWorld(), mHitSound, Hit.ImpactPoint);
}

if (IsValid(mHitDecal))
{
    UGameplayStatics::SpawnDecalAtLocation(
        GetWorld(), mHitDecal, FVector(20.0, 20.0, 10.0),
        Hit.ImpactPoint, (-Hit.ImpactNormal).Rotation(), 5.f);
}
```

![Wraith 이펙트 플레이테스트](./assets/images/wraith-particle-playtest.jpg)

이번 장에서 중요한 점은 이펙트가 "나중에 붙이는 장식"이 아니라는 것이다.
전투 체감은 대부분 히트 확인, 소리, 잔상, 데칼 같은 결과 표현에서 완성된다.
그래서 강의 제목이 `파티클과 사운드`지만, 실제로는 전투 파이프라인의 마지막 단계를 배우는 시간에 가깝다.

### 3.5 장 정리

제3장은 전투 결과를 플레이어가 인지할 수 있는 형태로 완성하는 단계다.
데미지는 시스템적 결과이고, 사운드와 파티클은 감각적 결과이며, 투사체와 데칼은 전투 표현을 공간 안에 남기는 수단이다.

---

## 전체 정리

`260409`를 층으로 다시 정리하면 다음과 같다.

1. `PlayerAnimInstance`와 `PlayerTemplateAnimInstance`가 공용 애님 구조를 만든다.
2. `Collision` 설정과 커스텀 프로파일이 전투 판정 규칙을 만든다.
3. `AnimNotify_PlayerAttack`이 타격 프레임에 실제 판정 함수를 호출한다.
4. `SweepMultiByChannel`과 `TakeDamage`가 게임 로직 결과를 만든다.
5. `SpawnSoundAtLocation`, `SpawnEmitterAtLocation`, `SpawnDecalAtLocation`, `ProjectileMovement`가 체감 결과를 만든다.

즉 이번 날짜는 "공격 버튼"이 단순 입력 이벤트가 아니라, 애님과 시스템과 이펙트가 합쳐진 하나의 파이프라인이라는 점을 보여 준다.

## 복습 체크리스트

- 템플릿 애님이 공용 구조만 공유하고 에셋은 개별로 남긴다는 의미를 설명할 수 있는가
- `오브젝트 채널`과 `트레이스 채널`의 차이를 말할 수 있는가
- `Player`와 `PlayerAttack` 같은 프로파일을 왜 미리 정의하는지 설명할 수 있는가
- 공격 노티파이 시점에 Sweep을 호출해야 하는 이유를 설명할 수 있는가
- `TakeDamage`가 언리얼 전투 시스템에서 어떤 역할을 맡는지 정리할 수 있는가
- 근접 캐릭터와 원거리 캐릭터가 같은 전투 파이프라인 위에서 어떻게 다른 판정 방식을 쓰는지 설명할 수 있는가

## 세미나 질문

1. 템플릿 애님 구조를 도입했을 때, 공용화의 이점과 캐릭터 개성 손실 위험은 각각 어디서 나타날까
2. 공격 판정을 상시 충돌체가 아니라 Sweep 쿼리로 처리했을 때의 장단점은 무엇일까
3. 데미지 수치만 적용하고 이펙트를 생략하면 전투 체감이 왜 급격히 약해질까
4. 근접형의 직접 Sweep과 원거리형의 투사체 Spawn은 디버깅 관점에서 각각 어떤 차이를 가질까

## 권장 과제

1. `PlayerAttack` 프로파일 응답을 바꿔 보면서 어떤 대상에게만 맞게 만들 수 있는지 기록한다.
2. `Shinbi::NormalAttack()`의 캡슐 크기와 길이를 조절해 판정 체감이 어떻게 바뀌는지 비교한다.
3. `WraithBullet`에 데미지 적용이나 팀 판정 필터를 더해 근접 공격과 동등한 파이프라인으로 확장한다.
4. `PlayerTemplateAnimInstance`에 캐릭터별 커스텀 스킬 섹션 이름을 더 안전하게 매핑하는 구조를 설계해 본다.
