import { describe, expect, it } from "vitest";
import {
  canAccessAdmin,
  isAdmin,
  isValidSlug,
  isVisibleToViewer,
  normalizeSlug,
  validateCourseInput,
} from "./admin";

describe("isAdmin", () => {
  it("admin なら true", () => {
    expect(isAdmin("admin")).toBe(true);
  });

  it("user は false", () => {
    expect(isAdmin("user")).toBe(false);
  });

  it("null / undefined / 空文字は false（未ログインは入れない）", () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
    expect(isAdmin("")).toBe(false);
  });

  it("大文字 Admin は false（値は厳密一致で判定する）", () => {
    expect(isAdmin("Admin")).toBe(false);
  });
});

describe("canAccessAdmin", () => {
  it("role=admin のユーザーは入れる", () => {
    expect(canAccessAdmin({ role: "admin" })).toBe(true);
  });

  it("role=user のユーザーは入れない", () => {
    expect(canAccessAdmin({ role: "user" })).toBe(false);
  });

  it("未ログイン(null)は入れない", () => {
    expect(canAccessAdmin(null)).toBe(false);
  });

  it("roleが無いユーザーは入れない", () => {
    expect(canAccessAdmin({})).toBe(false);
  });
});

describe("isVisibleToViewer", () => {
  it("公開済みは誰にでも見える", () => {
    expect(isVisibleToViewer({ published: true }, "user")).toBe(true);
    expect(isVisibleToViewer({ published: true }, null)).toBe(true);
  });

  it("下書きは一般ユーザーには見えない", () => {
    expect(isVisibleToViewer({ published: false }, "user")).toBe(false);
    expect(isVisibleToViewer({ published: false }, null)).toBe(false);
  });

  it("下書きでも管理者には見える", () => {
    expect(isVisibleToViewer({ published: false }, "admin")).toBe(true);
  });
});

describe("isValidSlug", () => {
  it("小文字英数字とハイフンはOK", () => {
    expect(isValidSlug("claude-code-intro")).toBe(true);
    expect(isValidSlug("ep31")).toBe(true);
  });

  it("大文字・空白・日本語・記号はNG", () => {
    expect(isValidSlug("Claude-Code")).toBe(false);
    expect(isValidSlug("claude code")).toBe(false);
    expect(isValidSlug("クロード")).toBe(false);
    expect(isValidSlug("claude_code")).toBe(false);
  });

  it("先頭末尾のハイフン・連続ハイフンはNG", () => {
    expect(isValidSlug("-intro")).toBe(false);
    expect(isValidSlug("intro-")).toBe(false);
    expect(isValidSlug("claude--code")).toBe(false);
  });

  it("空文字はNG", () => {
    expect(isValidSlug("")).toBe(false);
  });
});

describe("normalizeSlug", () => {
  it("大文字と空白を整える", () => {
    expect(normalizeSlug("Claude Code Intro")).toBe("claude-code-intro");
  });

  it("記号を落として前後のハイフンを削る", () => {
    expect(normalizeSlug("  Claude Code 入門!  ")).toBe("claude-code");
  });
});

describe("validateCourseInput", () => {
  it("正常な入力を受け付ける", () => {
    const result = validateCourseInput({
      title: "Claude Code 入門",
      slug: "claude-code-intro",
      description: "  はじめての講座  ",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Claude Code 入門");
      expect(result.value.slug).toBe("claude-code-intro");
      expect(result.value.description).toBe("はじめての講座");
    }
  });

  it("タイトルが空ならエラー", () => {
    const result = validateCourseInput({ title: "   ", slug: "abc" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("タイトルを入力してください");
    }
  });

  it("スラッグ未入力ならタイトルから自動生成する", () => {
    const result = validateCourseInput({ title: "Claude Code Intro" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.slug).toBe("claude-code-intro");
  });

  it("不正な形式のスラッグはエラー", () => {
    const result = validateCourseInput({
      title: "テスト",
      slug: "invalid slug!",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes("スラッグ"))).toBe(true);
    }
  });

  it("説明が空なら null になる", () => {
    const result = validateCourseInput({ title: "テスト", slug: "test" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.description).toBeNull();
  });
});
