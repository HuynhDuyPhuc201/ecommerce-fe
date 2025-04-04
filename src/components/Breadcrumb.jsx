import React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

const BreadcrumbComponent = ({ arrayItem }) => {
  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    ...arrayItem?.map((item) => ({
      title: item.href ? <Link to={`/${item.href}`}>{item.text}</Link> : item.text,
    })),
  ];

  return (
    <div className="pb-5">
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
};

export default BreadcrumbComponent;
