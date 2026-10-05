'use client'
import type { ComponentProps, FC } from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'
import { cn } from '@shared/lib/utils'

export const Slider: FC<ComponentProps<typeof SliderPrimitive.Root>> = ({ className, value, defaultValue, min, max, ...props }) => (
    <SliderPrimitive.Root
        data-slot='slider'
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        className={cn(
            'relative flex w-full touch-none select-none items-center data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
            className,
        )}
        {...props}>
        <SliderPrimitive.Track
            data-slot='slider-track'
            className='relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'>
            <SliderPrimitive.Range
                data-slot='slider-range'
                className='absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'
            />
        </SliderPrimitive.Track>
        {(value ?? defaultValue ?? [min ?? 0]).map((_, index) => (
            <SliderPrimitive.Thumb
                key={index}
                data-slot='slider-thumb'
                aria-label={props['aria-label']}
                className='block size-4 shrink-0 rounded-full border border-primary bg-background ring-ring/50 transition-[box-shadow] focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none'
            />
        ))}
    </SliderPrimitive.Root>
)
