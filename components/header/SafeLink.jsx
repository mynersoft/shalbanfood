import Link from 'next/link';

const SafeLink = ({ href, children, className }) => {
  if (!href) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};

export default SafeLink;
