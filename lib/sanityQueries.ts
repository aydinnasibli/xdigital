import { client } from "@/sanity/lib/client";


export const getFaqWeb = async () => {
    const now = new Date().toISOString();
    return client.fetch(`
    *[_type == "faqWeb" && publishedAt <= $now] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      mainImage,
      publishedAt,
      "categories": categories[]->title,
      "author": author->{name, image, bio}
    }
  `, { now })
}
