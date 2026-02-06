import React from 'react';
import { gsap } from 'gsap';

export default class FlowingMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: props.items || [],
        };

        this.menuRef = React.createRef();
        this.listRef = React.createRef();
    }

    componentDidMount() {
        this.initMenu();
    }

    initMenu() {
        const { items } = this.state;
        const menu = this.menuRef.current;
        const list = this.listRef.current;

        if (!menu || !list) return;

        const itemHeight = 100; // Adjust based on your styling
        const totalHeight = items.length * itemHeight;

        // Basic setup for demonstration
        // In a real flowing menu, you'd use GSAP to animate position based on scroll/mouse
        // For now, let's just ensure it renders nicely with the requested theme
    }

    render() {
        const { items } = this.state;

        return (
            <div
                ref={this.menuRef}
                className="flowing-menu-container w-full h-full bg-[#060010] text-white overflow-hidden relative"
            >
                <div ref={this.listRef} className="menu-list absolute top-0 left-0 w-full">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="menu-item h-[100px] flex items-center px-8 border-b border-[#5227FF]/20 hover:bg-[#5227FF]/10 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 w-full">
                                <span className="text-[#5227FF] text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Icon placeholder if needed */}
                                    →
                                </span>
                                <h2 className="text-4xl font-bold font-sans text-white group-hover:text-[#B19EEF] transition-colors">
                                    {item.text}
                                </h2>
                                <span className="ml-auto text-sm text-gray-500 group-hover:text-white transition-colors">
                                    {item.description}
                                </span>
                                <div className="w-[200px] h-[80px] rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity absolute right-8 pointer-events-none">
                                    <img src={item.image} alt={item.text} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
