import { prisma } from "@/lib/prisma";
import EnquiryInboxClient from "./EnquiryInboxClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: Promise<{ selected?: string }>;
}

export default async function AdminEnquiriesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const selectedId = searchParams?.selected;

  const enquiries = await prisma.enquiry.findMany({
    include: {
      aiExtraction: true,
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <EnquiryInboxClient
      initialEnquiries={enquiries as any}
      initialSelectedId={selectedId}
    />
  );
}

