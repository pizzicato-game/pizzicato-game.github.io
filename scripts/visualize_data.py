import csv
import pygame
import sys
import math

def visualize_positions(csv_file):
    """Visualizes normalized positions from a CSV file."""

    data = {}
    layers = set()
    note_indices = {}
    loop_indices = {}

    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        header = next(reader)
        for row in reader:
            try:
                layer_id = int(row[0])
                layers.add(layer_id)
                note_id = int(row[1])
                pinch_type = row[2]
                loop_id = int(row[3])
                pinky_x, pinky_y = (float(row[11]), float(row[12])) if row[11] != 'null' else (None, None)
                ring_x, ring_y = (float(row[13]), float(row[14])) if row[13] != 'null' else (None, None)
                middle_x, middle_y = (float(row[15]), float(row[16])) if row[15] != 'null' else (None, None)
                index_x, index_y = (float(row[17]), float(row[18])) if row[17] != 'null' else (None, None)
                thumb_x, thumb_y = (float(row[19]), float(row[20])) if row[19] != 'null' else (None, None)
                target_x = float(row[8]) if row[8] != 'null' else None
                target_y = float(row[9]) if row[9] != 'null' else None
                normalized_target_radius = float(row[7]) if row[7] != 'null' else 0.0
                normalized_finger_radius = float(row[10]) if row[10] != 'null' else 0.0
                player_time = float(row[4]) if row[4] != 'null' else -1
                correct_time = float(row[5]) if row[5] != 'null' else 0

                if layer_id not in data:
                    data[layer_id] = []
                    note_indices[layer_id] = {}
                    loop_indices[layer_id] = {}

                data[layer_id].append({
                    'positions': {
                        'pinky': (pinky_x, pinky_y),
                        'ring': (ring_x, ring_y),
                        'middle': (middle_x, middle_y),
                        'index': (index_x, index_y),
                        'thumb': (thumb_x, thumb_y),
                        'target': (target_x, target_y),
                    },
                    'row_data': row,
                    'normalized_target_radius': normalized_target_radius,
                    'normalized_finger_radius': normalized_finger_radius,
                    'player_time': player_time,
                    'correct_time': correct_time,
                })
                note_indices[layer_id][note_id] = len(data[layer_id]) - 1
                if loop_id not in loop_indices[layer_id]:
                    loop_indices[layer_id][loop_id] = {}
                loop_indices[layer_id][loop_id][note_id] = len(data[layer_id]) - 1

            except (ValueError, IndexError):
                print(f"Skipping invalid row: {row}")

    if not data:
        print("No valid data found in CSV file.")
        return

    pygame.init()
    screen_width, screen_height = 800, 600
    screen = pygame.display.set_mode((screen_width, screen_height), pygame.DOUBLEBUF | pygame.HWSURFACE)
    pygame.display.set_caption("Finger Position Visualization")
    font = pygame.font.Font(None, 24)

    layers = sorted(list(layers))
    current_layer = min(layers) if layers else None
    current_loop = None
    current_index = 0

    if current_layer is not None and current_layer in loop_indices:
        loops = sorted(list(loop_indices[current_layer].keys()))
        if loops:
            current_loop = min(loops)
            notes = sorted(list(loop_indices[current_layer][current_loop].keys()))
            if notes:
                current_index = loop_indices[current_layer][current_loop][min(notes)]

    running = True

    layer_buttons = {}
    note_buttons = {}
    loop_buttons = {}
    selected_note = None
    buttons_x_offset = 60

    def update_note_buttons(layer):
        nonlocal selected_note
        note_buttons.clear()
        if layer in note_indices:
            notes = sorted(list(note_indices[layer].keys()))
            y_offset = screen_height - (3 * 35)
            button_height = 30
            total_width = 0
            button_widths = []

            for note in notes:
                text_surf = font.render(str(note), True, (255, 255, 255))
                button_widths.append(text_surf.get_rect().width + 10)
                total_width += button_widths[-1] + 5

            available_width = screen_width - buttons_x_offset - 10
            if total_width > available_width:
                scale_factor = available_width / total_width
                scaled_button_widths = [int(w * scale_factor) for w in button_widths]
            else:
                scaled_button_widths = button_widths

            x_offset = buttons_x_offset
            for i, note in enumerate(notes):
                button_rect = pygame.Rect(x_offset, y_offset, scaled_button_widths[i], button_height)
                note_buttons[note] = button_rect
                x_offset += scaled_button_widths[i] + 5

            if notes:
                if selected_note is None or selected_note not in notes:
                    selected_note = min(notes)
        return y_offset - 4

    def update_loop_buttons(layer):
        loop_buttons.clear()
        if layer in loop_indices:
            loops = sorted(list(loop_indices[layer].keys()))
            x_offset = buttons_x_offset
            for loop in loops:
                text_surf = font.render(str(loop), True, (255, 255, 255))
                text_rect = text_surf.get_rect()
                button_rect = pygame.Rect(x_offset, screen_height - (2 * 35), text_rect.width + 10, 30)
                loop_buttons[loop] = button_rect
                x_offset += button_rect.width + 5

    def update_layer_buttons():
        layer_buttons.clear()
        x_offset = buttons_x_offset
        for layer in layers:
            text_surf = font.render(str(layer), True, (255, 255, 255))
            text_rect = text_surf.get_rect()
            button_rect = pygame.Rect(x_offset, screen_height - 35, text_rect.width + 10, 30)
            layer_buttons[layer] = button_rect
            x_offset += button_rect.width + 5

    lowest_note_button_y = update_note_buttons(current_layer)
    update_loop_buttons(current_layer)
    update_layer_buttons()

    def draw_positions(layer, index):
        screen.fill((0, 0, 0))
        if layer not in data or index >= len(data[layer]):
            return

        row_data = data[layer][index]['row_data']
        positions = data[layer][index]['positions']
        target_radius = data[layer][index]['normalized_target_radius'] * screen_width
        finger_radius = data[layer][index]['normalized_finger_radius'] * screen_width
        player_time = data[layer][index]['player_time']
        correct_time = data[layer][index]['correct_time']

        colors = {
            'thumb': (255, 255, 255),
            'index': (228, 26, 28),
            'middle': (0, 150, 255),
            'ring': (255, 234, 0),
            'pinky': (218, 112, 214),
            'target': (0, 255, 0),
        }

        pinch_to_finger_color = {
            'thumb': colors['thumb'],
            'index': colors['index'],
            'middle': colors['middle'],
            'ring': colors['ring'],
            'pinky': colors['pinky']
        }

        draw_rect = pygame.Rect(0, 0, screen_width, lowest_note_button_y)

        pygame.draw.rect(screen, (50, 50, 50), draw_rect)

        for finger, position in positions.items():
            x, y = position
            if x is not None and y is not None:
                scaled_x = x * draw_rect.width + draw_rect.x
                scaled_y = y * draw_rect.height + draw_rect.y

                center = (int(scaled_x), int(scaled_y))
                alpha = 128

                if finger == 'target':
                    target_surface = pygame.Surface((int(target_radius * 2), int(target_radius * 2)), pygame.SRCALPHA)
                    pygame.draw.circle(target_surface, (255, 255, 255, alpha), (int(target_radius), int(target_radius)), int(target_radius))
                    screen.blit(target_surface, (center[0] - int(target_radius), center[1] - int(target_radius)))

                    if row_data[2] in pinch_to_finger_color:
                        pygame.draw.circle(screen, pinch_to_finger_color[row_data[2]], center, int(target_radius), 3)

                else:
                    pygame.draw.circle(screen, colors[finger], center, int(finger_radius), 3)

        info_text = f"NoteID: {row_data[1]}, PinchType: {row_data[2]}, CorrectTime: {row_data[5]}, PlayerTime: {row_data[4]}, Classification: {row_data[6]}"
        text_surface = font.render(info_text, True, (255, 255, 255))
        screen.blit(text_surface, (10, 10))

        mouse_pos = pygame.mouse.get_pos()
        button_colors = {
            'default': (100, 100, 100),
            'selected': (0, 128, 0),
            'hover': (150, 150, 150)
        }

        def draw_buttons(buttons, selected_key=None):
            for key, rect in buttons.items():
                button_color = button_colors['default']
                if key == selected_key:
                    button_color = button_colors['selected']
                elif rect.collidepoint(mouse_pos):
                    button_color = button_colors['hover']
                pygame.draw.rect(screen, button_color, rect)
                text_surf = font.render(str(key), True, (255, 255, 255))
                text_rect = text_surf.get_rect(center=rect.center)
                screen.blit(text_surf, text_rect)

        draw_buttons(layer_buttons, current_layer)
        draw_buttons(loop_buttons, current_loop)
        draw_buttons(note_buttons, selected_note)

        label_font = pygame.font.Font(None, 20)
        layer_label = label_font.render("Layer:", True, (255, 255, 255))
        loop_label = label_font.render("Loop:", True, (255, 255, 255))
        note_label = label_font.render("Note:", True, (255, 255, 255))

        screen.blit(layer_label, (10, screen_height - 35 + 15 - (label_font.get_height() / 2)))
        screen.blit(loop_label, (10, screen_height - (2 * 35) + 15 - (label_font.get_height() / 2)))
        screen.blit(note_label, (10, screen_height - (3 * 35) + 15 - (label_font.get_height() / 2)))

        # Calculate and display normalized distance to target
        if current_layer in data and current_index < len(data[current_layer]):
            current_data = data[current_layer][current_index]
            thumb_pos = current_data['positions']['thumb']
            target_pos = current_data['positions']['target']
            pinch_type = row_data[2]

            if thumb_pos and target_pos:
                finger_pos = current_data['positions'].get(pinch_type)

                if finger_pos:
                    thumb_x, thumb_y = thumb_pos
                    finger_x, finger_y = finger_pos
                    target_x, target_y = target_pos

                    if thumb_x is not None and thumb_y is not None and finger_x is not None and finger_y is not None and target_x is not None and target_y is not None:
                        midpoint_x = (thumb_x + finger_x) / 2
                        midpoint_y = (thumb_y + finger_y) / 2

                        distance = math.sqrt((midpoint_x - target_x)**2 + (midpoint_y - target_y)**2)

                        scaled_midpoint_x = midpoint_x * draw_rect.width + draw_rect.x
                        scaled_midpoint_y = midpoint_y * draw_rect.height + draw_rect.y
                        scaled_target_x = target_x * draw_rect.width + draw_rect.x
                        scaled_target_y = target_y * draw_rect.height + draw_rect.y

                        pixel_distance = math.sqrt((scaled_midpoint_x - scaled_target_x)**2 + (scaled_midpoint_y - scaled_target_y)**2)

                        distance_text = font.render(f"Normalized Distance To Target: {distance:.4f} ({pixel_distance:.2f} px),", True, (255, 255, 255))
                        # Move text to bottom left of the gray drawing rect
                        screen.blit(distance_text, (10, lowest_note_button_y - distance_text.get_height() - 10))

                        # Display Player Pinch Delay
                        if player_time != -1:
                            delay_milliseconds = (player_time - correct_time) * 1000
                            delay_text = font.render(f"Player Pinch Delay: {delay_milliseconds:.1f} ms", True, (255, 255, 255))
                        else:
                            delay_text = font.render("Player Pinch Delay: N/A", True, (255, 255, 255))

                        screen.blit(delay_text, (10 + distance_text.get_width() + 10, lowest_note_button_y - delay_text.get_height() - 10))

        pygame.display.flip()

    draw_positions(current_layer, current_index)

    clock = pygame.time.Clock()
    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    if current_loop is not None and current_layer is not None and selected_note is not None:
                        notes = sorted(list(loop_indices[current_layer][current_loop].keys()))
                        if notes:
                            if selected_note in notes:
                                index = notes.index(selected_note)
                                if index > 0:
                                    selected_note = notes[index - 1]
                                    current_index = loop_indices[current_layer][current_loop][selected_note]
                                    draw_positions(current_layer, current_index)
                elif event.key == pygame.K_RIGHT:
                    if current_loop is not None and current_layer is not None and selected_note is not None:
                        notes = sorted(list(loop_indices[current_layer][current_loop].keys()))
                        if notes:
                            if selected_note in notes:
                                index = notes.index(selected_note)
                                if index < len(notes) - 1:
                                    selected_note = notes[index + 1]
                                    current_index = loop_indices[current_layer][current_loop][selected_note]
                                    draw_positions(current_layer, current_index)
            elif event.type == pygame.MOUSEBUTTONDOWN:
                mouse_pos = pygame.mouse.get_pos()
                for l, rect in layer_buttons.items():
                    if rect.collidepoint(mouse_pos):
                        current_layer = l
                        lowest_note_button_y = update_note_buttons(current_layer)
                        update_loop_buttons(current_layer)
                        if current_layer in loop_indices:
                            loops = sorted(list(loop_indices[current_layer].keys()))
                            if loops:
                                current_loop = min(loops)
                                notes = sorted(list(loop_indices[current_layer][current_loop].keys()))
                                if notes:
                                    current_index = loop_indices[current_layer][current_loop][min(notes)]
                                    selected_note = min(notes)
                        else:
                            current_loop = None
                            current_index = 0
                            selected_note = None

                        draw_positions(current_layer, current_index)
                for note, rect in note_buttons.items():
                    if rect.collidepoint(mouse_pos):
                        if current_loop is not None:
                            current_index = loop_indices[current_layer][current_loop][note]
                            selected_note = note
                        else:
                            current_index = note_indices[current_layer][note]
                            selected_note = note
                        draw_positions(current_layer, current_index)
                for loop, rect in loop_buttons.items():
                    if rect.collidepoint(mouse_pos):
                        current_loop = loop
                        if current_layer in loop_indices and loop in loop_indices[current_layer]:
                            notes = sorted(list(loop_indices[current_layer][loop].keys()))
                            if notes:
                                current_index = loop_indices[current_layer][loop][min(notes)]
                                selected_note = min(notes)
                        draw_positions(current_layer, current_index)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python visualize_positions.py <csv_file>")
    else:
        csv_file = sys.argv[1]
        visualize_positions(csv_file)