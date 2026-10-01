---
name: study-chapter-pr
description: >-
  Publishes a finished study-chapter note to GitHub for this study group:
  creates a per-chapter branch, commits the single note file, pushes, and opens
  a PR against main. Trigger when the user wants to submit or share a chapter
  write-up, e.g. "1장 올려줘", "정리 PR 만들어줘", "1~3장 한 번에 올려줘",
  or points at a file like 01장/이진혁.md.
---

# 스터디 챕터 노트 PR 올리기

노트는 사용자가 이미 써 둔 상태다. 이 스킬은 글을 만들지 않고, 그 파일을 팀이
토론할 수 있게 PR로 올리는 일만 한다. 담당자·리뷰어 지정은 저장소 설정
(`auto_assign`, `CODEOWNERS`)이 처리하므로 건드리지 않는다.

## 이름 규칙

| 대상        | 형식                      | 예                         |
| ----------- | ------------------------- | -------------------------- |
| 노트 파일   | `NN장/<이름>.md`          | `01장/이진혁.md`           |
| 브랜치      | `NN장/<이름>`             | `01장/이진혁`              |
| 커밋 메시지 | `NN장 <이름> 정리 추가`   | `01장 이진혁 정리 추가`    |
| PR 제목     | `[<이름>] <n>장 - <주제>` | `[이진혁] 1장 - 챕터 주제` |

`NN`은 두 자리(01), PR 제목의 `n`은 0 없는 숫자(1)다.

## 1. 올리기 전에 확인할 것

요청에서 아래 값을 모은다. 하나라도 비면 추측하지 말고 사용자에게 묻는다.

- **장 번호 `n`, 이름**: 노트 경로에서 읽는다. `01장/이진혁.md` → 장 1, 이름 이진혁.
- **주제**: 루트 `README.md` 일정 표에서 `n장 `으로 시작하는 항목의 제목을 쓴다.
  한 셀에 `1장 …<br>2장 …<br>3장 …`처럼 이어져 있으니 `<br>`와 `|`를 경계로 잘라
  해당 장만 취한다. 표에 없는 장이면 사용자에게 묻는다.
- **노트 파일 존재 여부**: 없으면 중단하고 알린다.
- **토론 포인트**: 묻지 않는다. 사용자가 요청에 함께 적어 준 문장이 있으면 그대로 쓰고,
  없으면 빈 칸으로 올린다. 작성자가 PR 생성 후 직접 채운다. 내용을 지어내지 않는다.

커밋은 사용자가 요청했을 때만 만든다.

## 2. 실행

장 하나당 아래를 한 번 실행한다. 여러 장(예: 1~3장)이면 장마다 `main`에서 다시 시작해
PR을 각각 연다. 한 PR에 여러 장을 섞으면 코멘트 토론이 뒤엉키기 때문이다.

```bash
branch="NN장/<이름>"
note="NN장/<이름>.md"

git switch main && git pull --ff-only origin main
git switch -c "$branch"            # 이미 있으면 git switch "$branch"
git add -- "$note"                 # 이 파일만. 다른 변경은 스테이징하지 않는다
git commit -m "NN장 <이름> 정리 추가"
git push -u origin "$branch"
```

브랜치가 이미 있으면 그걸 이어서 쓰고, 원격과 갈라졌거나 충돌이 있으면 사용자에게 알린다.

```bash
gh pr create --base main \
  --title "[<이름>] <n>장 - <주제>" \
  --body "$(cat <<'EOF'
## Summary
- <n>장 정리 `NN장/<이름>.md` 추가

## 토론하고 싶은 포인트
- <사용자가 적어 준 내용, 없으면 비워 둠>
EOF
)"
```

## 3. 끝낸 뒤

`gh pr diff --name-only`로 PR에 노트 파일 하나만 들어갔는지 확인하고,
PR 주소를 사용자에게 전한다. 여러 장이면 장별 주소를 모두 전한다.
토론 포인트를 비워 뒀다면 PR 설명에서 직접 채우면 된다고 한 줄 덧붙인다.
