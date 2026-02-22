import type { PageSection } from './types'
import { HeroBlock } from './blocks/HeroBlock'
import { RichTextBlock } from './blocks/RichTextBlock'
import { GalleryBlock } from './blocks/GalleryBlock'
import { CTABlock } from './blocks/CTABlock'
import { FAQBlock } from './blocks/FAQBlock'

interface Props {
  sections: PageSection[]
}

export function BlockRenderer({ sections }: Props) {
  return (
    <>
      {sections.map((block, index) => {
        const key = block.id ?? `block-${index}`
        switch (block.blockType) {
          case 'hero':
            return <HeroBlock key={key} {...block} />
          case 'richText':
            return <RichTextBlock key={key} {...block} />
          case 'gallery':
            return <GalleryBlock key={key} {...block} />
          case 'cta':
            return <CTABlock key={key} {...block} />
          case 'faq':
            return <FAQBlock key={key} {...block} />
          default:
            return null
        }
      })}
    </>
  )
}
