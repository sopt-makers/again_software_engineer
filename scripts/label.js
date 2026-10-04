module.exports = async ({ github, context, core }) => {
  const names = {
    namdaeun: "남다은",
    "jin-evergreen": "박진석",
    sonnnnhe: "손하은",
    "constantly-dev": "이진혁",
    tnalxmsk: "장민수",
    exceptanyone: "장정안",
    jeonghoon11: "장정훈",
    jogpfls: "조혜린",
    mimizae: "지민재",
    wuzoo: "최주용",
  };
  const pr = context.payload.pull_request;
  const name = names[pr.user.login.toLowerCase()];
  if (!name) {
    core.setFailed(`이름 매핑이 없는 작성자입니다: ${pr.user.login}`);
    return;
  }

  const { data: readme } = await github.rest.repos.getContent({
    ...context.repo,
    path: "README.md",
    ref: pr.base.sha,
  });
  const schedule = Buffer.from(readme.content, "base64").toString("utf8");
  const chapterWeeks = new Map();
  for (const row of schedule.split("\n")) {
    const week = row.match(/^\|\s*([1-4])주\s*\|/);
    if (!week) continue;
    for (const chapter of row.matchAll(/(\d+)장/g)) {
      chapterWeeks.set(Number(chapter[1]), `${week[1]}주차`);
    }
  }

  const files = await github.paginate(github.rest.pulls.listFiles, {
    ...context.repo,
    pull_number: pr.number,
    per_page: 100,
  });
  const chapters = files
    .filter((file) => file.status !== "removed")
    .map((file) => file.filename.match(/^(\d{2})장\/[^/]+\.md$/))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  const weeks = new Set(chapters.map((chapter) => chapterWeeks.get(chapter)));
  if (weeks.size !== 1 || weeks.has(undefined)) {
    core.setFailed(
      "제출 파일은 README에 지정된 한 주차에 속해야 합니다. 후순위 장 또는 여러 주차가 섞였는지 확인하세요.",
    );
    return;
  }

  await github.rest.issues.addLabels({
    ...context.repo,
    issue_number: pr.number,
    labels: [[...weeks][0], name],
  });
};
