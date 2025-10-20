# sistema_hospital/cuentas/templatetags/cuentas_tags.py
from django import template

register = template.Library()

@register.filter(name='add_classes')
def add_classes(value, arg):
    """
    Adds CSS classes to a Django form field widget.
    Example: {{ field|add_classes:'form-control my-custom-class' }}
    """
    css_classes = value.field.widget.attrs.get('class', '')
    new_classes_list = str(arg).split()
    existing_classes_list = css_classes.split()

    for new_class in new_classes_list:
        if new_class not in existing_classes_list:
            existing_classes_list.append(new_class)

    final_classes = ' '.join(existing_classes_list)
    return value.as_widget(attrs={'class': final_classes})