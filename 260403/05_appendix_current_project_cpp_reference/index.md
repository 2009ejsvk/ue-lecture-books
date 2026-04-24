---
title: 260403 부록 2 - 현재 프로젝트 C++로 다시 읽는 판정 구조
---

# 부록 2. 현재 프로젝트 C++로 다시 읽는 판정 구조

[이전: 부록 1](../04_appendix_official_docs_reference/) | [허브](../)

## 이 부록의 목표

이 부록에서는 `260403`의 블루프린트 개념이 현재 `UE20252` C++ 코드에서 어떤 모습으로 남아 있는지 다시 읽는다.
핵심은 강의 예제가 사라진 것이 아니라, `Projectile Stop`, `Hit`, `Overlap`, `TakeDamage`, `SetTimer` 문법이 더 실전적인 구조로 자랐다는 점을 확인하는 것이다.

## 같이 볼 코드

- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Etc\ProjectileBase.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\WraithBullet.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Etc\GeometryActor.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Etc\ItemBox.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\MonsterBase.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\MonsterSpawnPoint.h`

## `AProjectileBase`는 `Projectile Stop`의 가장 얇은 대응 코드다

강의에서 블루프린트 `BPBullet`의 `On Projectile Stop`을 배웠다면, 현재 C++에서는 `AProjectileBase`가 가장 직접적인 대응물이다.

```cpp
mBody = CreateDefaultSubobject<UBoxComponent>(TEXT("Body"));
mMovement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));

SetRootComponent(mBody);
mMovement->SetUpdatedComponent(mBody);
mMovement->OnProjectileStop.AddDynamic(this, &AProjectileBase::ProjectileStop);
```

즉 발사체는 별도 액터이고, 충돌체와 이동 컴포넌트를 가지며, 멈추는 순간 후속 처리 함수로 들어간다는 구조가 그대로 남아 있다.

## `AWraithBullet`은 `Hit`와 `Hit Result`를 실전형으로 확장한다

실전형 투사체는 `AWraithBullet`에서 더 잘 보인다.

```cpp
mBody->SetCollisionProfileName(TEXT("PlayerAttack"));
mBody->OnComponentHit.AddDynamic(this, &AWraithBullet::BulletHit);
```

그리고 `BulletHit()`는 충돌 위치와 방향 정보를 그대로 연출에 쓴다.

```cpp
Destroy();
UGameplayStatics::SpawnEmitterAtLocation(GetWorld(), mHitParticle, Hit.ImpactPoint);
UGameplayStatics::SpawnSoundAtLocation(GetWorld(), mHitSound, Hit.ImpactPoint);
UGameplayStatics::SpawnDecalAtLocation(
    GetWorld(), mHitDecal,
    FVector(20.0, 20.0, 10.0),
    Hit.ImpactPoint,
    (-Hit.ImpactNormal).Rotation(),
    5.f
);
```

즉 `Hit Result`는 지금도 연출과 후속 처리의 핵심 정보 묶음이다.

## 일반 충돌은 `AGeometryActor`에서 같은 원리로 이어진다

투사체 전용 이벤트만이 충돌의 전부는 아니다.
`AGeometryActor`는 일반 오브젝트 `Hit`가 어떻게 후속 처리를 여는지 보여 준다.

```cpp
mGeometry->OnComponentHit.AddDynamic(this, &AGeometryActor::GeometryHit);
mGeometry->ApplyExternalStrain(ItemIndex, Hit.ImpactPoint, 50.f, 1, 1.f, 1500000.f);
```

즉 강의 1편의 충돌 철학은 현재 branch에서 파괴 오브젝트 쪽으로도 자연스럽게 확장된 상태다.

## 태그 입문은 현재 프로젝트에서 충돌 프로파일과 팀 ID로 성장했다

강의의 `PlayerBullet`, `MonsterBullet` 태그 방식은 지금도 좋은 입문법이다.
실제로 플레이어 쪽 초기 발사 프로토타입에는 아래 주석이 남아 있다.

```cpp
// Bullet->SetLifeSpan(5.f);
// Bullet->Tags.Add(TEXT("PlayerBullet"));
```

하지만 현재 프로젝트는 그 위에 더 정교한 구분을 얹었다.

```cpp
GetCapsuleComponent()->SetCollisionProfileName(TEXT("Player"));
SetGenericTeamId(FGenericTeamId(TeamPlayer));

mBody->SetCollisionProfileName(TEXT("Monster"));
SetGenericTeamId(FGenericTeamId(TeamMonster));
```

그리고 실제 체력 변화는 `AMonsterBase::TakeDamage()`에서 처리한다.

```cpp
float Dmg = Super::TakeDamage(DamageAmount, DamageEvent, EventInstigator, DamageCauser);
Dmg -= mDefense;
if (Dmg < 1.f)
    Dmg = 1.f;
mHP -= Dmg;
```

즉 흐름은 이렇게 정리할 수 있다.

- 입문 실습
  태그로 소속 구분
- 현재 branch
  충돌 프로파일 + 팀 ID + `TakeDamage()`로 더 정교한 판정

## `Overlap` 실습은 `AItemBox`에서 액터 내부 이벤트로 정리되어 있다

`Trigger Box + Level Blueprint`의 교육용 실습은 현재 코드에 그대로 남아 있지 않지만, 같은 원리는 액터 내부로 옮겨 갔다.

```cpp
mBody->OnComponentBeginOverlap.AddDynamic(this, &AItemBox::ItemOverlap);

void AItemBox::ItemOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
    UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep,
    const FHitResult& SweepResult)
{
    Destroy();
}
```

즉 `Overlap` 이벤트를 시작점으로 삼는 감각 자체는 그대로 유지되고, 책임만 `Level Blueprint`에서 액터 내부로 이동한 셈이다.

## 타이머 문법은 `AMonsterSpawnPoint`에서 C++ API로 확인할 수 있다

강의 2편의 정확한 반복 발사 예제는 `BPTestMonster` 덤프가 가장 직접적이다.
다만 현재 C++에도 같은 타이머 API 문법은 분명히 남아 있다.

```cpp
void ClearSpawn()
{
    if (mSpawnTime > 0.f)
    {
        GetWorldTimerManager().SetTimer(
            mSpawnTimer,
            this,
            &AMonsterSpawnPoint::SpawnTimerFinish,
            mSpawnTime,
            false
        );
    }
    else
    {
        SpawnMonster();
    }
}
```

블루프린트의 `Set Timer by Event`가 C++에선 `GetWorldTimerManager().SetTimer(...)`로 대응된다고 이해하면 된다.

## 지금 기준으로 260403를 읽는 가장 좋은 방법

1. 편별 문서에서 `충돌 -> 태그/타이머 -> 트리거` 개념을 먼저 잡는다.
2. 그다음 `ProjectileBase.cpp`, `WraithBullet.cpp`, `ItemBox.cpp`를 보며 이벤트 입구 차이를 찾는다.
3. 마지막으로 `MonsterBase.cpp`, `MonsterSpawnPoint.h`를 보면 판정과 시간 제어가 실전 코드로 성장한 방향이 보인다.

## 이 부록의 핵심 정리

1. `Projectile Stop`, `Hit`, `Overlap`은 현재 C++에서도 모두 살아 있다.
2. 태그 기반 입문 규칙은 현재 branch에서 충돌 프로파일, 팀 ID, `TakeDamage()`로 발전했다.
3. `Level Blueprint` 실습은 액터 내부 이벤트로 책임이 이동했을 뿐, 원리는 그대로 유지된다.
4. 타이머 문법도 블루프린트와 C++가 같은 개념을 다른 표기법으로 공유한다.
