const MenuButton = ({ isOpen, onClick, color = 'black', style = {} }) => {
  const lineStyle = {
    display: 'block',
    width: '28px',
    height: '2.5px',
    backgroundColor: color,
    transition: 'all 0.3s ease',
    position: 'absolute',
    left: 0,
  };

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        width: '28px',
        height: '28px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'all',
        ...style,
      }}
    >
      <span
        style={{
          ...lineStyle,
          top: isOpen ? '50%' : '6px',
          transform: isOpen ? 'translateY(-50%) rotate(45deg)' : 'none',
        }}
      />
      <span
        style={{
          ...lineStyle,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: isOpen ? 0 : 1,
        }}
      />
      <span
        style={{
          ...lineStyle,
          width: isOpen ? '28px' : '18px',
          bottom: isOpen ? 'auto' : '6px',
          top: isOpen ? '50%' : 'auto',
          transform: isOpen ? 'translateY(-50%) rotate(-45deg)' : 'none',
        }}
      />
    </div>
  );
};

export default MenuButton;
