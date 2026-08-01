import Link from "next/link";

import { ArrowIcon } from "@/components/arrow-icon";
import type { Service } from "@/lib/services";

type ServiceCardProps = {
  service: Service;
  detailed?: boolean;
};

export function ServiceCard({ service, detailed = false }: ServiceCardProps) {
  return (
    <article className={`service-card accent-${service.accent}`} id={detailed ? service.slug : undefined}>
      <div className="service-card-top">
        <span>{service.number}</span>
        <span className="service-pulse" aria-hidden="true" />
      </div>
      <h3>{service.title}</h3>
      <p>{service.summary}</p>
      {detailed ? (
        <>
          <div className="service-outcome">
            <span>Outcome</span>
            <p>{service.outcome}</p>
          </div>
          <ul>
            {service.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : (
        <Link href={`/services#${service.slug}`} className="text-link">
          See what we deliver <ArrowIcon />
        </Link>
      )}
    </article>
  );
}
