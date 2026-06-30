# Detail Page Style Templates

Use these templates as selectable production styles. Recommend 1-2 styles based on product category, target customer, and sales intent.

## Style Options

| 코드 | 스타일 | 적합한 상황 | 구성 특징 |
|---|---|---|---|
| A | 쿠팡 실용 정보형 | 빠른 비교, 가격/기능 중심, 생활용품·식품·가전 | 흰 배경, 큰 상품컷, 짧은 혜택 문구, 정보 카드, 스펙/구성/주의 안내를 명확히 배치 |
| B | 네이버 브랜드 스토리형 | 브랜드몰, 스마트스토어, 프리미엄 소상공인 | 브랜드 무드, 제작/원료/철학, 감성 히어로, 디테일 컷, 신뢰 정보 균형 |
| C | 프리미엄 뷰티/감성형 | 뷰티, 패션, 향수, 선물형 상품 | 고급 배경, 모델/사용 컷, 컬러칩, 제형/텍스처, 여백 많은 타이포그래피 |
| D | 문제해결 인포그래픽형 | 고객 불편을 해결하는 기능성 상품 | 문제 제기, 해결 구조, 전후 비교, 아이콘, 기능 분해, FAQ 중심 |
| E | 라이프스타일 사용장면형 | 일상 루틴, 인테리어, 반려동물, 유아동, 푸드 | 실제 사용 장면, 생활 맥락, 크기 비교, 사용 순서, 상황별 컷 |
| F | 선물/패키지 강조형 | 명절, 기념일, 고급 포장, 세트 상품 | 패키지, 구성품, 언박싱, 선물 상황, 메시지 카드, 배송 포장 |
| G | 리뷰·신뢰 근거형 | 리뷰/인증/시험자료/판매 데이터가 있는 상품 | 리뷰 요약, 인증/시험자료, 비교표, 신뢰 배지, 구매 불안 해소 |

## Recommendation Rules

If Wadiz OpenCrab packs return a category playbook or assembly formula, use that playbook to choose the primary style and use this table only to resolve ambiguity. Preserve the selected Wadiz rhythm in `opencrab-runtime-context.md`.

- If channel is Coupang or commodity-like, recommend A unless brand mood is more important.
- If channel is Smart Store or brand/seller story matters, recommend B.
- If category is beauty/cosmetics/fashion/fragrance, recommend C first, then B or G depending on evidence.
- If the key claim is functional problem solving, recommend D.
- If actual usage is the main persuasion point, recommend E.
- If the product is a set, seasonal item, or gift, recommend F.
- If the user provides reviews, certifications, test reports, or numerical evidence, recommend G.

## Style Application

Apply the chosen style to:

- Headline tone: practical, brand-like, premium, problem-solving, lifestyle, gift, or trust-focused.
- Layout density: information-heavy for A/D/G, whitespace-heavy for B/C/F, scene-heavy for E.
- Image prompts: include the selected style name and its layout rules in every final image-generation prompt.
- Compliance: never fabricate reviews, certifications, rankings, sale numbers, or performance claims just because the selected style expects trust proof.

## Research Notes

These templates synthesize marketplace and platform patterns observed from current public references:

- Coupang detail pages emphasize platform-fit product images, detail image constraints, readable mobile assets, and clear product information.
- Naver/Smart Store patterns favor mobile detail pages with product story, brand trust, and store-specific creative assets.
- Cafe24 PRO exposes multiple detail-page template choices and stresses mobile optimization/design checks.
