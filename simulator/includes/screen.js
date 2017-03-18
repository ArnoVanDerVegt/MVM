wheel(
    'simulator.includes.screen',
    [
        '#define MODULE_SCREEN        1',
        '',
        '#define SCREEN_CLEAR         0',
        '#define SCREEN_FILL          1',
        '#define SCREEN_FILL_COLOR    2',
        '#define SCREEN_SET_TEXT_SIZE 3',
        '#define SCREEN_DRAW_PIXEL    4',
        '#define SCREEN_DRAW_NUMBER   5',
        '#define SCREEN_DRAW_TEXT     6',
        '#define SCREEN_DRAW_LINE     7',
        '#define SCREEN_DRAW_RECT     8',
        '#define SCREEN_DRAW_CIRCLE   9',
        '#define SCREEN_DRAW_IMAGE    10',
        '',
        '#define WHITE                0',
        '#define BLACK                1',
        '',
        'proc clearScreen()',
        '    module   MODULE_SCREEN,          SCREEN_CLEAR',
        'endp',
        '',
        'proc setFill(number fill)',
        '    struct SetFill',
        '        number fill',
        '    ends',
        '    SetFill setFill',
        '    set      setFill.fill,           fill',
        '    addr     setFill',
        '    module   MODULE_SCREEN,          SCREEN_FILL',
        'endp',
        '',
        'proc setFillColor(number fillColor)',
        '    struct SetFillColor',
        '        number fillColor',
        '    ends',
        '    SetFillColor setFillColor',
        '    set      setFillColor.fillColor, fillColor',
        '    addr     setFillColor',
        '    module   MODULE_SCREEN,          SCREEN_FILL_COLOR',
        'endp',
        '',
        'proc setTextSize(number textSize)',
        '    struct SetTextSize',
        '        number textSize',
        '    ends',
        '    SetTextSize setTextSize',
        '    set      setTextSize.textSize,   textSize',
        '    addr     setTextSize',
        '    module   MODULE_SCREEN,          SCREEN_SET_TEXT_SIZE',
        'endp',
        '',
        'proc drawPixel(number x, number y)',
        '    struct DrawPixel',
        '        number   x, y',
        '    ends',
        '    DrawPixel drawPixel',
        '    set      drawPixel.x,            x',
        '    set      drawPixel.y,            y',
        '    addr     drawPixel',
        '    module   MODULE_SCREEN,          SCREEN_DRAW_PIXEL',
        'endp',
        '',
        'proc drawNumber(number x, number y, number n)',
        '    struct DrawNumber',
        '        number   x, y, n',
        '    ends',
        '    DrawNumber drawNumber',
        '    set      drawNumber.x,           x',
        '    set      drawNumber.y,           y',
        '    set      drawNumber.n,           n',
        '    addr     drawNumber',
        '    module   MODULE_SCREEN,          SCREEN_DRAW_NUMBER',
        'endp',
        '',
        'proc drawText(number x, number y, string s)',
        '    struct DrawText',
        '        number   x, y',
        '        string   s',
        '    ends',
        '    DrawText drawText',
        '    set      drawText.x,             x',
        '    set      drawText.y,             y',
        '    set      drawText.s,             s',
        '    addr     drawText',
        '    module   MODULE_SCREEN,          SCREEN_DRAW_TEXT',
        'endp',
        '',
        'proc drawLine(number x1, number y1, number x2, number y2)',
        '    struct DrawLine',
        '        number   x1, y1, x2, y2',
        '    ends',
        '    DrawLine drawLine',
        '    set      drawLine.x1,            x1',
        '    set      drawLine.y1,            y1',
        '    set      drawLine.x2,            x2',
        '    set      drawLine.y2,            y2',
        '    addr     drawLine',
        '    module   MODULE_SCREEN,          SCREEN_DRAW_LINE',
        'endp',
        '',
        'proc drawRect(number x, number y, number width, number height)',
        '    struct DrawRect',
        '        number   x, y, width, height',
        '    ends',
        '    DrawRect drawRect',
        '    set      drawRect.x,             x',
        '    set      drawRect.y,             y',
        '    set      drawRect.width,         width',
        '    set      drawRect.height,        height',
        '    addr     drawRect',
        '    module   MODULE_SCREEN,          SCREEN_DRAW_RECT',
        'endp',
        '',
        'proc drawCircle(number x, number y, number radius)',
        '    struct DrawCircle',
        '        number   x, y, radius',
        '    ends',
        '    DrawCircle drawCircle',
        '    set      drawCircle.x,           x',
        '    set      drawCircle.y,           y',
        '    set      drawCircle.radius,      radius',
        '    addr     drawCircle',
        '    module   MODULE_SCREEN,          SCREEN_DRAW_CIRCLE',
        'endp',
        '',
        'proc drawImage(number x, number y, string filename)',
        '    struct DrawImage',
        '        number   x, y',
        '        string   filename',
        '    ends',
        '    DrawImage drawImage',
        '    set      drawImage.x,            x',
        '    set      drawImage.y,            y',
        '    set      drawImage.filename,     filename',
        '    addr     drawImage',
        '    module   MODULE_SCREEN,          SCREEN_DRAW_IMAGE',
        'endp'
    ]
);