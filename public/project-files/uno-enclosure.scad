// Units: mm. The front wall is at x = 0. Measure your own board and plug.
part = "base"; // [base,lid,gauge]
length = 86;
width = 67;
height = 27;
wall = 2.4;
floor = 2.4;
lid_thickness = 2.4;
usb_center = 48; // distance from the y = 0 long edge
usb_width = 18;
usb_bottom = 6.5; // measured from the outside bottom of the base
lid_gap = 0.35; // clearance per side on each locating tab
eps = 0.02;
tab_depth = 3;

assert(length >= 82 && width >= 64 && height >= 24,
       "Keep enough room for the Uno, supports and cable.");
assert(usb_center - usb_width/2 > wall && usb_center + usb_width/2 < width-wall,
       "USB notch must stay between the long walls.");
assert(usb_bottom > floor && usb_bottom < height-10,
       "Keep material below the notch and space above the plug.");
assert(lid_gap > 0 && lid_gap <= 1, "Check the lid clearance.");

module base() {
    difference() {
        cube([length,width,height]);
        translate([wall,wall,floor])
            cube([length-2*wall,width-2*wall,height]);
        translate([-eps,usb_center-usb_width/2,usb_bottom])
            cube([wall+2*eps,usb_width,height]);
    }
}

module lid() {
    // Exterior face down for printing. Flip over and keep the long edges parallel to close.
    difference() {
        union() {
            cube([length,width,lid_thickness]);
            for (x = [12,length-22], y = [wall+lid_gap,width-wall-lid_gap-2])
                translate([x,y,lid_thickness-eps])
                    cube([10,2,tab_depth+eps]);
        }
        for (i = [-2:2])
            translate([length/2-13,width/2+i*5-1,-eps])
                cube([26,2,lid_thickness+2*eps]);
    }
}

module gauge() {
    // Face-down sample of the same open USB notch, for a quick width check.
    difference() {
        cube([height,usb_width+10,wall]);
        translate([usb_bottom,5,-eps])
            cube([height,usb_width,wall+2*eps]);
    }
}

if (part == "base") base();
else if (part == "lid") lid();
else if (part == "gauge") gauge();
else assert(false, "Choose base, lid or gauge.");
