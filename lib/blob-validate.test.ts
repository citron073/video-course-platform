import { describe, expect, it } from "vitest";
import {
  DEFAULT_MAX_MB,
  isAllowedImageType,
  isWithinSizeLimit,
  validateThumbnail,
} from "./blob-validate";

describe("isAllowedImageType", () => {
  it("png / jpeg / webp / gif は許可", () => {
    expect(isAllowedImageType("image/png")).toBe(true);
    expect(isAllowedImageType("image/jpeg")).toBe(true);
    expect(isAllowedImageType("image/webp")).toBe(true);
    expect(isAllowedImageType("image/gif")).toBe(true);
  });

  it("大文字・前後空白でも正規化して許可", () => {
    expect(isAllowedImageType("IMAGE/PNG")).toBe(true);
    expect(isAllowedImageType("  image/jpeg  ")).toBe(true);
  });

  it("許可外の MIME は不許可", () => {
    expect(isAllowedImageType("image/svg+xml")).toBe(false);
    expect(isAllowedImageType("image/bmp")).toBe(false);
    expect(isAllowedImageType("application/pdf")).toBe(false);
    expect(isAllowedImageType("text/html")).toBe(false);
  });

  it("null / undefined / 空文字は不許可", () => {
    expect(isAllowedImageType(null)).toBe(false);
    expect(isAllowedImageType(undefined)).toBe(false);
    expect(isAllowedImageType("")).toBe(false);
  });
});

describe("isWithinSizeLimit", () => {
  const MB = 1024 * 1024;

  it("上限内のサイズはOK", () => {
    expect(isWithinSizeLimit(1 * MB)).toBe(true);
    expect(isWithinSizeLimit(4 * MB)).toBe(true);
  });

  it("境界＝ちょうど上限(5MB)はOK", () => {
    expect(isWithinSizeLimit(DEFAULT_MAX_MB * MB)).toBe(true);
  });

  it("境界＝上限+1バイトはNG", () => {
    expect(isWithinSizeLimit(DEFAULT_MAX_MB * MB + 1)).toBe(false);
  });

  it("上限を超えるサイズはNG", () => {
    expect(isWithinSizeLimit(6 * MB)).toBe(false);
  });

  it("0以下・不正な値はNG", () => {
    expect(isWithinSizeLimit(0)).toBe(false);
    expect(isWithinSizeLimit(-1)).toBe(false);
    expect(isWithinSizeLimit(NaN)).toBe(false);
  });

  it("maxMB を指定すると上限が変わる", () => {
    expect(isWithinSizeLimit(2 * MB, 1)).toBe(false);
    expect(isWithinSizeLimit(1 * MB, 1)).toBe(true);
  });
});

describe("validateThumbnail", () => {
  const MB = 1024 * 1024;

  it("許可MIME＋上限内サイズは ok:true", () => {
    const result = validateThumbnail({ type: "image/png", size: 2 * MB });
    expect(result.ok).toBe(true);
  });

  it("許可外MIMEは ok:false（MIMEエラーを含む）", () => {
    const result = validateThumbnail({ type: "image/svg+xml", size: 1 * MB });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes("PNG"))).toBe(true);
    }
  });

  it("サイズ超過は ok:false（サイズエラーを含む）", () => {
    const result = validateThumbnail({ type: "image/png", size: 6 * MB });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes("MB"))).toBe(true);
    }
  });

  it("MIME・サイズ両方NGならエラーは2件", () => {
    const result = validateThumbnail({ type: "application/pdf", size: 10 * MB });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(2);
    }
  });

  it("境界＝ちょうど上限(5MB)＋許可MIMEは ok:true", () => {
    const result = validateThumbnail({
      type: "image/jpeg",
      size: DEFAULT_MAX_MB * MB,
    });
    expect(result.ok).toBe(true);
  });
});
