import type { HelperOptions } from "handlebars";
import type { PrintableImage } from "../markdown-composer.types";

const DEFAULT_COLUMNS = 3;

interface ChunkRowsArgs {
  items: PrintableImage[];
  columns: number;
}

const chunkRows = ({ items, columns }: ChunkRowsArgs): PrintableImage[][] => {
  const rows: PrintableImage[][] = [];

  for (let index = 0; index < items.length; index += columns) {
    rows.push(items.slice(index, index + columns));
  }

  return rows;
};

const escapeMarkdownTableCell = (value: string): string => value.replaceAll("|", "\\|");

const toMarkdownImage = (image: PrintableImage): string =>
  `![${escapeMarkdownTableCell(image.filename)}](${image.imageDataURI})`;

interface BuildMarkdownImagesTableArgs {
  orderedPrintableImages: PrintableImage[];
  columns: number;
}

const buildMarkdownImagesTable = ({ orderedPrintableImages, columns }: BuildMarkdownImagesTableArgs): string => {
  if (orderedPrintableImages.length === 0 || columns < 1) {
    return "";
  }

  const rows = chunkRows({ items: orderedPrintableImages, columns });

  const tables = rows.map((row, rowIndex) => {
    const header = `| ${row.map((_, colIndex) => rowIndex * columns + colIndex + 1).join(" | ")} |`;
    const separator = `|${Array.from({ length: row.length }, () => ":---:").join("|")}|`;
    const images = `| ${row.map(toMarkdownImage).join(" | ")} |`;
    return [header, separator, images].join("\n");
  });

  return tables.join("\n\n");
};

interface BuildMarkdownImagesTableFromObjectsArgs {
  objects: string[];
  printableImages: Record<string, PrintableImage>;
  columns: number;
}

const buildMarkdownImagesTableFromObjects = ({
  objects,
  printableImages,
  columns,
}: BuildMarkdownImagesTableFromObjectsArgs): string => {
  const orderedPrintableImages = objects.flatMap((uuid) => {
    const image = printableImages[uuid];
    return image ? [image] : [];
  });

  return buildMarkdownImagesTable({ orderedPrintableImages, columns });
};

type PrintableImages = Record<string, PrintableImage>;

// eslint-disable-next-line project/max-params, @typescript-eslint/max-params -- Handlebars helper positional signature
export const markdownImagesTableHelper = (objects: string[], imgs: PrintableImages, opts: HelperOptions): string => {
  const columns = Number(opts.hash?.columns) || DEFAULT_COLUMNS;

  return buildMarkdownImagesTableFromObjects({
    objects,
    printableImages: imgs,
    columns,
  });
};
