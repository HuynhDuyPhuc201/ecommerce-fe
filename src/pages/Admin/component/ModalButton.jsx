import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export const ModalButton = ({ title, onClick }) => {
    return (
        <div className="text-center flex-col items-center justify-center">
            <h1 className="h-[40px] md:w-[100px] w-[80px]">{title}</h1>
            <Button
                onClick={onClick}
                className="p-20 border plus-border flex items-center justify-center md:w-[100px] md:h-[100px] w-[80px] h-[80px] mt-5 cursor-pointer "
                style={{ border: '1px solid', padding: '20px' }}
            >
                <PlusOutlined />
            </Button>
        </div>
    );
};
